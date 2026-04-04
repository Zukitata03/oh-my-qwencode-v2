import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { AgentDefinition } from "../definitions.js";
import {
  generateAgentToml,
  installNativeAgentConfigs,
} from "../native-config.js";

const originalStandardModel = process.env.OMQ_DEFAULT_STANDARD_MODEL;

beforeEach(() => {
  process.env.OMQ_DEFAULT_STANDARD_MODEL = "qwen3.6-flash";
});

afterEach(() => {
  if (typeof originalStandardModel === "string") {
    process.env.OMQ_DEFAULT_STANDARD_MODEL = originalStandardModel;
  } else {
    delete process.env.OMQ_DEFAULT_STANDARD_MODEL;
  }
});

describe("agents/native-config", () => {
  it("generates TOML with stripped frontmatter and escaped triple quotes", () => {
    const agent: AgentDefinition = {
      name: "executor",
      description: "Code implementation",
      reasoningEffort: "medium",
      posture: "deep-worker",
      modelClass: "standard",
      routingRole: "executor",
      tools: "execution",
      category: "build",
    };

    const prompt = `---\ntitle: demo\n---\n\nInstruction line\n\"\"\"danger\"\"\"`;
    const toml = generateAgentToml(agent, prompt);

    assert.match(toml, /# oh-my-qwencode agent: executor/);
    assert.match(toml, /model = "qwen3.6-plus"/);
    // Note: model_reasoning_effort is no longer written to agent config TOML
    assert.doesNotMatch(toml, /model_reasoning_effort/);
    assert.ok(!toml.includes("title: demo"));
    assert.ok(toml.includes("Instruction line"));
    assert.ok(toml.includes("You are operating in the deep-worker posture."));
    assert.ok(toml.includes("- posture: deep-worker"));

    const tripleQuoteBlocks = toml.match(/"""/g) || [];
    assert.equal(
      tripleQuoteBlocks.length,
      2,
      "only TOML delimiters should remain as raw triple quotes",
    );
  });

  it("applies exact-model mini guidance only for resolved qwen3.6-flash standard roles", () => {
    const agent: AgentDefinition = {
      name: "debugger",
      description: "Root-cause analysis",
      reasoningEffort: "medium",
      posture: "deep-worker",
      modelClass: "standard",
      routingRole: "executor",
      tools: "analysis",
      category: "build",
    };

    const prompt = "Instruction line";
    const exactMiniToml = generateAgentToml(agent, prompt, {
      env: { OMQ_DEFAULT_STANDARD_MODEL: "qwen3.6-flash" } as NodeJS.ProcessEnv,
    });
    const frontierToml = generateAgentToml(agent, prompt, {
      env: { OMQ_DEFAULT_STANDARD_MODEL: "qwen3.6-plus" } as NodeJS.ProcessEnv,
    });
    const tunedToml = generateAgentToml(agent, prompt, {
      env: { OMQ_DEFAULT_STANDARD_MODEL: "qwen3.6-flash-tuned" } as NodeJS.ProcessEnv,
    });

    assert.match(exactMiniToml, /exact qwen3.6-flash model/);
    assert.match(exactMiniToml, /strict execution order: inspect -> plan -> act -> verify/);
    assert.match(exactMiniToml, /resolved_model: qwen3.6-flash/);
    assert.doesNotMatch(frontierToml, /exact qwen3.6-flash model/);
    assert.doesNotMatch(tunedToml, /exact qwen3.6-flash model/);
  });

  it("installs only agents with prompt files and skips existing files without force", async () => {
    const root = await mkdtemp(join(tmpdir(), "omq-native-config-"));
    const promptsDir = join(root, "prompts");
    const outDir = join(root, "agents-out");

    try {
      await mkdir(promptsDir, { recursive: true });
      await writeFile(join(promptsDir, "executor.md"), "executor prompt");
      await writeFile(join(promptsDir, "planner.md"), "planner prompt");

      const created = await installNativeAgentConfigs(root, {
        agentsDir: outDir,
      });
      assert.equal(created, 2);
      assert.equal(existsSync(join(outDir, "executor.toml")), true);
      assert.equal(existsSync(join(outDir, "planner.toml")), true);

      const executorToml = await readFile(
        join(outDir, "executor.toml"),
        "utf8",
      );
      assert.match(executorToml, /model = "qwen3.6-plus"/);
      // Note: model_reasoning_effort is no longer written to agent config TOML
      assert.doesNotMatch(executorToml, /model_reasoning_effort/);

      const skipped = await installNativeAgentConfigs(root, {
        agentsDir: outDir,
      });
      assert.equal(skipped, 0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps standard agents off a custom qwen3.5-plus root model", async () => {
    const root = await mkdtemp(join(tmpdir(), "omq-native-config-root-model-"));
    const qwenHome = join(root, ".qwen");
    const promptsDir = join(root, "prompts");
    const outDir = join(qwenHome, "agents");
    const previousQwenHome = process.env.QWEN_HOME;

    try {
      delete process.env.OMQ_DEFAULT_STANDARD_MODEL;
      process.env.QWEN_HOME = qwenHome;
      await mkdir(promptsDir, { recursive: true });
      await mkdir(qwenHome, { recursive: true });
      await writeFile(join(qwenHome, "config.toml"), 'model = "qwen3.5-plus"\n');
      await writeFile(join(promptsDir, "debugger.md"), "debugger prompt");

      await installNativeAgentConfigs(root, { agentsDir: outDir });
      const debuggerToml = await readFile(join(outDir, "debugger.toml"), "utf8");
      assert.match(debuggerToml, /model = "qwen3.6-flash"/);
      assert.doesNotMatch(debuggerToml, /model = "qwen3.5-plus"/);
    } finally {
      if (typeof previousQwenHome === "string") process.env.QWEN_HOME = previousQwenHome;
      else delete process.env.QWEN_HOME;
      process.env.OMQ_DEFAULT_STANDARD_MODEL = "qwen3.6-flash";
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps executor on the frontier lane so an explicit qwen3.5-plus root model still applies there", async () => {
    const root = await mkdtemp(join(tmpdir(), "omq-native-config-executor-model-"));
    const qwenHome = join(root, ".qwen");
    const promptsDir = join(root, "prompts");
    const outDir = join(qwenHome, "agents");
    const previousQwenHome = process.env.QWEN_HOME;

    try {
      delete process.env.OMQ_DEFAULT_STANDARD_MODEL;
      process.env.QWEN_HOME = qwenHome;
      await mkdir(promptsDir, { recursive: true });
      await mkdir(qwenHome, { recursive: true });
      await writeFile(join(qwenHome, "config.toml"), 'model = "qwen3.5-plus"\n');
      await writeFile(join(promptsDir, "executor.md"), "executor prompt");

      await installNativeAgentConfigs(root, { agentsDir: outDir });
      const executorToml = await readFile(join(outDir, "executor.toml"), "utf8");
      assert.match(executorToml, /model = "qwen3.5-plus"/);
    } finally {
      if (typeof previousQwenHome === "string") process.env.QWEN_HOME = previousQwenHome;
      else delete process.env.QWEN_HOME;
      process.env.OMQ_DEFAULT_STANDARD_MODEL = "qwen3.6-flash";
      await rm(root, { recursive: true, force: true });
    }
  });
});
