/**
 * omq uninstall - Remove oh-my-qwencode configuration and installed artifacts
 */

import { readFile, writeFile, readdir, rm } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import {
  stripExistingOmqBlocks,
  stripOmqEnvSettings,
  stripOmqTopLevelKeys,
  stripOmqFeatureFlags,
} from "../config/generator.js";
import { getPackageRoot } from "../utils/package.js";
import { AGENT_DEFINITIONS } from "../agents/definitions.js";
import { resolveScopeDirectories, type SetupScope } from "./setup.js";
import { readPersistedSetupScope } from "./index.js";
import { isOmqGeneratedAgentsMd } from "../utils/agents-md.js";

export interface UninstallOptions {
  dryRun?: boolean;
  keepConfig?: boolean;
  verbose?: boolean;
  purge?: boolean;
  scope?: SetupScope;
}

interface UninstallSummary {
  configCleaned: boolean;
  mcpServersRemoved: string[];
  agentEntriesRemoved: number;
  tuiSectionRemoved: boolean;
  topLevelKeysRemoved: boolean;
  featureFlagsRemoved: boolean;
  promptsRemoved: number;
  skillsRemoved: number;
  agentConfigsRemoved: number;
  agentsMdRemoved: boolean;
  cacheDirectoryRemoved: boolean;
}

const OMQ_MCP_SERVERS = [
  "omq_state",
  "omq_memory",
  "omq_code_intel",
  "omq_trace",
];

function detectOmqConfigArtifacts(config: string): {
  hasMcpServers: string[];
  hasAgentEntries: number;
  hasTuiSection: boolean;
  hasTopLevelKeys: boolean;
  hasFeatureFlags: boolean;
  hasExploreRoutingEnv: boolean;
} {
  const hasMcpServers = OMQ_MCP_SERVERS.filter((name) =>
    new RegExp(`\\[mcp_servers\\.${name}\\]`).test(config),
  );

  const agentNames = Object.keys(AGENT_DEFINITIONS);
  let hasAgentEntries = 0;
  for (const name of agentNames) {
    const tableKey = name.includes("-") ? `agents."${name}"` : `agents.${name}`;
    if (config.includes(`[${tableKey}]`)) {
      hasAgentEntries++;
    }
  }

  const hasTuiSection =
    /^\[tui\]/m.test(config) &&
    config.includes("oh-my-qwencode (OMQ) Configuration");

  const hasTopLevelKeys =
    /^\s*notify\s*=.*node/m.test(config) ||
    /^\s*model_reasoning_effort\s*=/m.test(config) ||
    /^\s*developer_instructions\s*=.*oh-my-qwencode/m.test(config);

  const hasFeatureFlags =
    /^\s*multi_agent\s*=\s*true/m.test(config) ||
    /^\s*child_agents_md\s*=\s*true/m.test(config);
  const hasExploreRoutingEnv = /^\s*USE_OMQ_EXPLORE_CMD\s*=/m.test(config);

  return {
    hasMcpServers,
    hasAgentEntries,
    hasTuiSection,
    hasTopLevelKeys,
    hasFeatureFlags,
    hasExploreRoutingEnv,
  };
}

async function cleanConfig(
  configPath: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<
  Pick<
    UninstallSummary,
    | "configCleaned"
    | "mcpServersRemoved"
    | "agentEntriesRemoved"
    | "tuiSectionRemoved"
    | "topLevelKeysRemoved"
    | "featureFlagsRemoved"
  >
> {
  const result = {
    configCleaned: false,
    mcpServersRemoved: [] as string[],
    agentEntriesRemoved: 0,
    tuiSectionRemoved: false,
    topLevelKeysRemoved: false,
    featureFlagsRemoved: false,
  };

  if (!existsSync(configPath)) {
    if (options.verbose) console.log("  config.toml not found, skipping.");
    return result;
  }

  const original = await readFile(configPath, "utf-8");
  const detected = detectOmqConfigArtifacts(original);

  result.mcpServersRemoved = detected.hasMcpServers;
  result.agentEntriesRemoved = detected.hasAgentEntries;
  result.tuiSectionRemoved = detected.hasTuiSection;
  result.topLevelKeysRemoved = detected.hasTopLevelKeys;
  result.featureFlagsRemoved = detected.hasFeatureFlags;

  // Strip OMQ tables block (MCP servers, agents, tui)
  let config = original;
  const { cleaned } = stripExistingOmqBlocks(config);
  config = cleaned;

  // Strip top-level keys
  config = stripOmqTopLevelKeys(config);

  // Strip feature flags
  config = stripOmqFeatureFlags(config);

  // Strip OMQ-managed env defaults
  config = stripOmqEnvSettings(config);

  // Normalize trailing whitespace
  config = config.trimEnd() + "\n";

  if (config !== original) {
    result.configCleaned = true;
    if (!options.dryRun) {
      await writeFile(configPath, config);
    }
    if (options.verbose) {
      console.log(
        `  ${options.dryRun ? "Would clean" : "Cleaned"} ${configPath}`,
      );
    }
  } else {
    if (options.verbose) console.log("  No OMQ config entries found.");
  }

  return result;
}

async function removeInstalledPrompts(
  promptsDir: string,
  pkgRoot: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<number> {
  const srcPromptsDir = join(pkgRoot, "prompts");
  if (!existsSync(srcPromptsDir) || !existsSync(promptsDir)) return 0;

  let removed = 0;
  const sourceFiles = await readdir(srcPromptsDir);

  for (const file of sourceFiles) {
    if (!file.endsWith(".md")) continue;
    const installed = join(promptsDir, file);
    if (!existsSync(installed)) continue;

    if (!options.dryRun) {
      await rm(installed, { force: true });
    }
    if (options.verbose)
      console.log(
        `  ${options.dryRun ? "Would remove" : "Removed"} prompt: ${file}`,
      );
    removed++;
  }

  return removed;
}

async function removeInstalledSkills(
  skillsDir: string,
  pkgRoot: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<number> {
  const srcSkillsDir = join(pkgRoot, "skills");
  if (!existsSync(srcSkillsDir) || !existsSync(skillsDir)) return 0;

  let removed = 0;
  const sourceEntries = await readdir(srcSkillsDir, { withFileTypes: true });

  for (const entry of sourceEntries) {
    if (!entry.isDirectory()) continue;
    const installed = join(skillsDir, entry.name);
    if (!existsSync(installed)) continue;

    if (!options.dryRun) {
      await rm(installed, { recursive: true, force: true });
    }
    if (options.verbose)
      console.log(
        `  ${options.dryRun ? "Would remove" : "Removed"} skill: ${entry.name}/`,
      );
    removed++;
  }

  return removed;
}

async function removeAgentConfigs(
  agentsDir: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<number> {
  if (!existsSync(agentsDir)) return 0;

  let removed = 0;
  const agentNames = Object.keys(AGENT_DEFINITIONS);

  for (const name of agentNames) {
    const configFile = join(agentsDir, `${name}.toml`);
    if (!existsSync(configFile)) continue;

    if (!options.dryRun) {
      await rm(configFile, { force: true });
    }
    if (options.verbose)
      console.log(
        `  ${options.dryRun ? "Would remove" : "Removed"} agent config: ${name}.toml`,
      );
    removed++;
  }

  // If the agents dir is now empty, remove it too
  if (!options.dryRun && existsSync(agentsDir)) {
    try {
      const remaining = await readdir(agentsDir);
      if (remaining.length === 0) {
        await rm(agentsDir, { recursive: true, force: true });
        if (options.verbose) console.log("  Removed empty agents directory.");
      }
    } catch {
      // Ignore errors when cleaning up empty dir
    }
  }

  return removed;
}

async function removeAgentsMd(
  agentsMdPath: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<boolean> {
  if (!existsSync(agentsMdPath)) return false;

  try {
    const content = await readFile(agentsMdPath, "utf-8");
    if (!isOmqGeneratedAgentsMd(content)) {
      if (options.verbose)
        console.log("  AGENTS.md is not OMQ-generated, skipping.");
      return false;
    }
  } catch {
    return false;
  }

  if (!options.dryRun) {
    await rm(agentsMdPath, { force: true });
  }
  if (options.verbose)
    console.log(`  ${options.dryRun ? "Would remove" : "Removed"} AGENTS.md`);
  return true;
}

async function removeCacheDirectory(
  projectRoot: string,
  options: Pick<UninstallOptions, "dryRun" | "verbose">,
): Promise<boolean> {
  const omqDir = join(projectRoot, ".omq");
  if (!existsSync(omqDir)) return false;

  if (!options.dryRun) {
    await rm(omqDir, { recursive: true, force: true });
  }
  if (options.verbose)
    console.log(`  ${options.dryRun ? "Would remove" : "Removed"} ${omqDir}`);
  return true;
}

function printSummary(summary: UninstallSummary, dryRun: boolean): void {
  const prefix = dryRun ? "[dry-run] Would remove" : "Removed";

  console.log("\nUninstall summary:");

  if (summary.configCleaned) {
    console.log(`  ${prefix} OMQ configuration block from config.toml`);
    if (summary.mcpServersRemoved.length > 0) {
      console.log(`    MCP servers: ${summary.mcpServersRemoved.join(", ")}`);
    }
    if (summary.agentEntriesRemoved > 0) {
      console.log(`    Agent entries: ${summary.agentEntriesRemoved}`);
    }
    if (summary.tuiSectionRemoved) {
      console.log("    TUI status line section");
    }
    if (summary.topLevelKeysRemoved) {
      console.log(
        "    Top-level keys (notify, model_reasoning_effort, developer_instructions)",
      );
    }
    if (summary.featureFlagsRemoved) {
      console.log("    Feature flags (multi_agent, child_agents_md)");
    }
  } else if (!summary.configCleaned && summary.mcpServersRemoved.length === 0) {
    console.log("  config.toml: no OMQ entries found (or --keep-config used)");
  }

  if (summary.promptsRemoved > 0) {
    console.log(`  ${prefix} ${summary.promptsRemoved} agent prompt(s)`);
  }
  if (summary.skillsRemoved > 0) {
    console.log(`  ${prefix} ${summary.skillsRemoved} skill(s)`);
  }
  if (summary.agentConfigsRemoved > 0) {
    console.log(
      `  ${prefix} ${summary.agentConfigsRemoved} native agent config(s)`,
    );
  }
  if (summary.agentsMdRemoved) {
    console.log(`  ${prefix} AGENTS.md`);
  }
  if (summary.cacheDirectoryRemoved) {
    console.log(`  ${prefix} .omq/ cache directory`);
  }

  const totalActions =
    (summary.configCleaned ? 1 : 0) +
    summary.promptsRemoved +
    summary.skillsRemoved +
    summary.agentConfigsRemoved +
    (summary.agentsMdRemoved ? 1 : 0) +
    (summary.cacheDirectoryRemoved ? 1 : 0);

  if (totalActions === 0) {
    console.log(
      "  Nothing to remove. oh-my-qwencode does not appear to be installed.",
    );
  }
}

export async function uninstall(options: UninstallOptions = {}): Promise<void> {
  const {
    dryRun = false,
    keepConfig = false,
    verbose = false,
    purge = false,
  } = options;

  const projectRoot = process.cwd();
  const pkgRoot = getPackageRoot();

  // Resolve scope (explicit --scope overrides persisted scope)
  const scope = options.scope ?? readPersistedSetupScope(projectRoot) ?? "user";
  const scopeDirs = resolveScopeDirectories(scope, projectRoot);

  console.log("oh-my-qwencode uninstall");
  console.log("=====================\n");
  if (dryRun) {
    console.log("[dry-run mode] No files will be modified.\n");
  }
  console.log(`Resolved scope: ${scope}\n`);

  const summary: UninstallSummary = {
    configCleaned: false,
    mcpServersRemoved: [],
    agentEntriesRemoved: 0,
    tuiSectionRemoved: false,
    topLevelKeysRemoved: false,
    featureFlagsRemoved: false,
    promptsRemoved: 0,
    skillsRemoved: 0,
    agentConfigsRemoved: 0,
    agentsMdRemoved: false,
    cacheDirectoryRemoved: false,
  };

  // Step 1: Clean config.toml
  if (keepConfig) {
    console.log("[1/5] Skipping config.toml cleanup (--keep-config).");
  } else {
    console.log("[1/5] Cleaning config.toml...");
    const configResult = await cleanConfig(scopeDirs.qwenConfigFile, {
      dryRun,
      verbose,
    });
    Object.assign(summary, configResult);
  }
  console.log();

  // Step 2: Remove installed prompts
  console.log("[2/5] Removing agent prompts...");
  summary.promptsRemoved = await removeInstalledPrompts(
    scopeDirs.promptsDir,
    pkgRoot,
    { dryRun, verbose },
  );
  console.log(
    `  ${dryRun ? "Would remove" : "Removed"} ${summary.promptsRemoved} prompt(s).`,
  );
  console.log();

  // Step 3: Remove native agent configs
  console.log("[3/5] Removing native agent configs...");
  summary.agentConfigsRemoved = await removeAgentConfigs(
    scopeDirs.nativeAgentsDir,
    { dryRun, verbose },
  );
  console.log(
    `  ${dryRun ? "Would remove" : "Removed"} ${summary.agentConfigsRemoved} agent config(s).`,
  );
  console.log();

  // Step 4: Remove installed skills
  console.log("[4/5] Removing skills...");
  summary.skillsRemoved = await removeInstalledSkills(
    scopeDirs.skillsDir,
    pkgRoot,
    { dryRun, verbose },
  );
  console.log(
    `  ${dryRun ? "Would remove" : "Removed"} ${summary.skillsRemoved} skill(s).`,
  );
  console.log();

  // Step 5: Remove AGENTS.md and optionally .omq/ cache directory
  console.log("[5/5] Cleaning up...");
  const agentsMdPath =
    scope === "project"
      ? join(projectRoot, "AGENTS.md")
      : join(scopeDirs.qwenHomeDir, "AGENTS.md");
  summary.agentsMdRemoved = await removeAgentsMd(agentsMdPath, {
    dryRun,
    verbose,
  });
  if (purge) {
    summary.cacheDirectoryRemoved = await removeCacheDirectory(projectRoot, {
      dryRun,
      verbose,
    });
  } else {
    // Always clean up setup-scope.json and hud-config.json
    const scopeFile = join(projectRoot, ".omq", "setup-scope.json");
    const hudConfig = join(projectRoot, ".omq", "hud-config.json");
    for (const f of [scopeFile, hudConfig]) {
      if (existsSync(f)) {
        if (!dryRun) await rm(f, { force: true });
        if (verbose)
          console.log(
            `  ${dryRun ? "Would remove" : "Removed"} ${basename(f)}`,
          );
      }
    }
  }
  console.log();

  printSummary(summary, dryRun);

  if (!dryRun) {
    console.log(
      '\noh-my-qwencode has been uninstalled. Run "omq setup" to reinstall.',
    );
  } else {
    console.log("\nRun without --dry-run to apply changes.");
  }
}
