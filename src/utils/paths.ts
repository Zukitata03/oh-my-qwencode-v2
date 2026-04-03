/**
 * Path utilities for oh-my-qwencode
 * Resolves Qwen Code config, skills, prompts, and state directories
 */

import { createHash } from "crypto";
import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { dirname, join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

/** Qwen Code home directory (~/.qwen/) */
export function qwenHome(): string {
  return process.env.QWEN_HOME || join(homedir(), ".qwen");
}

/** Qwen Code config file path (~/.qwen/config.toml) */
export function qwenConfigPath(): string {
  return join(qwenHome(), "config.toml");
}

/** Qwen Code prompts directory (~/.qwen/prompts/) */
export function qwenPromptsDir(): string {
  return join(qwenHome(), "prompts");
}

/** Qwen Code native agents directory (~/.qwen/agents/) */
export function qwenAgentsDir(qwenHomeDir?: string): string {
  return join(qwenHomeDir || qwenHome(), "agents");
}

/** Project-level Qwen Code native agents directory (.qwen/agents/) */
export function projectQwenAgentsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".qwen", "agents");
}

/** User-level skills directory ($QWEN_HOME/skills, defaults to ~/.qwen/skills/) */
export function userSkillsDir(): string {
  return join(qwenHome(), "skills");
}

/** Project-level skills directory (.qwen/skills/) */
export function projectSkillsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".qwen", "skills");
}

/** Historical legacy user-level skills directory (~/.agents/skills/) */
export function legacyUserSkillsDir(): string {
  return join(homedir(), ".agents", "skills");
}

export type InstalledSkillScope = "project" | "user";

export interface InstalledSkillDirectory {
  name: string;
  path: string;
  scope: InstalledSkillScope;
}

export interface SkillRootOverlapReport {
  canonicalDir: string;
  legacyDir: string;
  canonicalExists: boolean;
  legacyExists: boolean;
  canonicalSkillCount: number;
  legacySkillCount: number;
  overlappingSkillNames: string[];
  mismatchedSkillNames: string[];
}

async function readInstalledSkillsFromDir(
  dir: string,
  scope: InstalledSkillScope,
): Promise<InstalledSkillDirectory[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: join(dir, entry.name),
      scope,
    }))
    .filter((entry) => existsSync(join(entry.path, "SKILL.md")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Installed skill directories in scope-precedence order.
 * Project skills win over user-level skills with the same directory basename.
 */
export async function listInstalledSkillDirectories(
  projectRoot?: string,
): Promise<InstalledSkillDirectory[]> {
  const orderedDirs: Array<{ dir: string; scope: InstalledSkillScope }> = [
    { dir: projectSkillsDir(projectRoot), scope: "project" },
    { dir: userSkillsDir(), scope: "user" },
  ];

  const deduped: InstalledSkillDirectory[] = [];
  const seenNames = new Set<string>();

  for (const { dir, scope } of orderedDirs) {
    const skills = await readInstalledSkillsFromDir(dir, scope);
    for (const skill of skills) {
      if (seenNames.has(skill.name)) continue;
      seenNames.add(skill.name);
      deduped.push(skill);
    }
  }

  return deduped;
}

export async function detectLegacySkillRootOverlap(
  canonicalDir = userSkillsDir(),
  legacyDir = legacyUserSkillsDir(),
): Promise<SkillRootOverlapReport> {
  const [canonicalSkills, legacySkills] = await Promise.all([
    readInstalledSkillsFromDir(canonicalDir, "user"),
    readInstalledSkillsFromDir(legacyDir, "user"),
  ]);

  const canonicalHashes = await hashSkillDirectory(canonicalSkills);
  const legacyHashes = await hashSkillDirectory(legacySkills);
  const canonicalNames = new Set(canonicalSkills.map((skill) => skill.name));
  const legacyNames = new Set(legacySkills.map((skill) => skill.name));
  const overlappingSkillNames = [...canonicalNames]
    .filter((name) => legacyNames.has(name))
    .sort((a, b) => a.localeCompare(b));
  const mismatchedSkillNames = overlappingSkillNames.filter(
    (name) => canonicalHashes.get(name) !== legacyHashes.get(name),
  );

  return {
    canonicalDir,
    legacyDir,
    canonicalExists: existsSync(canonicalDir),
    legacyExists: existsSync(legacyDir),
    canonicalSkillCount: canonicalSkills.length,
    legacySkillCount: legacySkills.length,
    overlappingSkillNames,
    mismatchedSkillNames,
  };
}

async function hashSkillDirectory(
  skills: InstalledSkillDirectory[],
): Promise<Map<string, string>> {
  const hashes = new Map<string, string>();

  for (const skill of skills) {
    try {
      const content = await readFile(join(skill.path, "SKILL.md"), "utf-8");
      hashes.set(skill.name, createHash("sha256").update(content).digest("hex"));
    } catch {
      // Ignore unreadable SKILL.md files; existence is enough for overlap detection.
    }
  }

  return hashes;
}

/** oh-my-qwencode state directory (.omq/state/) */
export function omqStateDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omq", "state");
}

/** oh-my-qwencode project memory file (.omq/project-memory.json) */
export function omqProjectMemoryPath(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omq", "project-memory.json");
}

/** oh-my-qwencode notepad file (.omq/notepad.md) */
export function omqNotepadPath(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omq", "notepad.md");
}

/** oh-my-qwencode plans directory (.omq/plans/) */
export function omqPlansDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omq", "plans");
}

/** oh-my-qwencode logs directory (.omq/logs/) */
export function omqLogsDir(projectRoot?: string): string {
  return join(projectRoot || process.cwd(), ".omq", "logs");
}

/** Get the package root directory (where agents/, skills/, prompts/ live) */
export function packageRoot(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const candidate = join(__dirname, "..", "..");
    if (existsSync(join(candidate, "package.json"))) {
      return candidate;
    }
    const candidate2 = join(__dirname, "..");
    if (existsSync(join(candidate2, "package.json"))) {
      return candidate2;
    }
  } catch {
    // fall through to cwd fallback
  }
  return process.cwd();
}
