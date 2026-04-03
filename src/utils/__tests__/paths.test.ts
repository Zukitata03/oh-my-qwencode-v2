import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { join } from "path";
import { homedir, tmpdir } from "os";
import { existsSync } from "fs";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import {
  qwenHome,
  qwenConfigPath,
  qwenPromptsDir,
  userSkillsDir,
  projectSkillsDir,
  legacyUserSkillsDir,
  listInstalledSkillDirectories,
  detectLegacySkillRootOverlap,
  omqStateDir,
  omqProjectMemoryPath,
  omqNotepadPath,
  omqPlansDir,
  omqLogsDir,
  packageRoot,
} from "../paths.js";

describe("qwenHome", () => {
  let originalQwenHome: string | undefined;

  beforeEach(() => {
    originalQwenHome = process.env.QWEN_HOME;
  });

  afterEach(() => {
    if (typeof originalQwenHome === "string") {
      process.env.QWEN_HOME = originalQwenHome;
    } else {
      delete process.env.QWEN_HOME;
    }
  });

  it("returns QWEN_HOME env var when set", () => {
    process.env.QWEN_HOME = "/tmp/custom-qwen";
    assert.equal(qwenHome(), "/tmp/custom-qwen");
  });

  it("defaults to ~/.qwen when QWEN_HOME is not set", () => {
    delete process.env.QWEN_HOME;
    assert.equal(qwenHome(), join(homedir(), ".qwen"));
  });
});

describe("qwenConfigPath", () => {
  let originalQwenHome: string | undefined;

  beforeEach(() => {
    originalQwenHome = process.env.QWEN_HOME;
    process.env.QWEN_HOME = "/tmp/test-qwen";
  });

  afterEach(() => {
    if (typeof originalQwenHome === "string") {
      process.env.QWEN_HOME = originalQwenHome;
    } else {
      delete process.env.QWEN_HOME;
    }
  });

  it("returns config.toml under qwen home", () => {
    assert.equal(qwenConfigPath(), "/tmp/test-qwen/config.toml");
  });
});

describe("qwenPromptsDir", () => {
  let originalQwenHome: string | undefined;

  beforeEach(() => {
    originalQwenHome = process.env.QWEN_HOME;
    process.env.QWEN_HOME = "/tmp/test-qwen";
  });

  afterEach(() => {
    if (typeof originalQwenHome === "string") {
      process.env.QWEN_HOME = originalQwenHome;
    } else {
      delete process.env.QWEN_HOME;
    }
  });

  it("returns prompts/ under qwen home", () => {
    assert.equal(qwenPromptsDir(), "/tmp/test-qwen/prompts");
  });
});

describe("userSkillsDir", () => {
  let originalQwenHome: string | undefined;

  beforeEach(() => {
    originalQwenHome = process.env.QWEN_HOME;
    process.env.QWEN_HOME = "/tmp/test-qwen";
  });

  afterEach(() => {
    if (typeof originalQwenHome === "string") {
      process.env.QWEN_HOME = originalQwenHome;
    } else {
      delete process.env.QWEN_HOME;
    }
  });

  it("returns QWEN_HOME/skills", () => {
    assert.equal(userSkillsDir(), "/tmp/test-qwen/skills");
  });
});

describe("projectSkillsDir", () => {
  it("uses provided projectRoot", () => {
    assert.equal(projectSkillsDir("/my/project"), "/my/project/.qwen/skills");
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(projectSkillsDir(), join(process.cwd(), ".qwen", "skills"));
  });
});

describe("legacyUserSkillsDir", () => {
  let originalHome: string | undefined;

  beforeEach(() => {
    originalHome = process.env.HOME;
    process.env.HOME = "/tmp/test-home";
  });

  afterEach(() => {
    if (typeof originalHome === "string") {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
  });

  it("returns ~/.agents/skills under HOME", () => {
    assert.equal(legacyUserSkillsDir(), "/tmp/test-home/.agents/skills");
  });
});

describe("listInstalledSkillDirectories", () => {
  let originalQwenHome: string | undefined;

  beforeEach(() => {
    originalQwenHome = process.env.QWEN_HOME;
  });

  afterEach(() => {
    if (typeof originalQwenHome === "string") {
      process.env.QWEN_HOME = originalQwenHome;
    } else {
      delete process.env.QWEN_HOME;
    }
  });

  it("deduplicates by skill name and prefers project skills over user skills", async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), "omq-paths-project-"));
    const qwenHomeRoot = await mkdtemp(join(tmpdir(), "omq-paths-qwen-"));
    process.env.QWEN_HOME = qwenHomeRoot;

    try {
      const projectHelpDir = join(projectRoot, ".qwen", "skills", "help");
      const projectOnlyDir = join(
        projectRoot,
        ".qwen",
        "skills",
        "project-only",
      );
      const userHelpDir = join(qwenHomeRoot, "skills", "help");
      const userOnlyDir = join(qwenHomeRoot, "skills", "user-only");

      await mkdir(projectHelpDir, { recursive: true });
      await mkdir(projectOnlyDir, { recursive: true });
      await mkdir(userHelpDir, { recursive: true });
      await mkdir(userOnlyDir, { recursive: true });

      await writeFile(join(projectHelpDir, "SKILL.md"), "# project help\n");
      await writeFile(join(projectOnlyDir, "SKILL.md"), "# project only\n");
      await writeFile(join(userHelpDir, "SKILL.md"), "# user help\n");
      await writeFile(join(userOnlyDir, "SKILL.md"), "# user only\n");

      const skills = await listInstalledSkillDirectories(projectRoot);

      assert.deepEqual(
        skills.map((skill) => ({
          name: skill.name,
          scope: skill.scope,
        })),
        [
          { name: "help", scope: "project" },
          { name: "project-only", scope: "project" },
          { name: "user-only", scope: "user" },
        ],
      );
      assert.equal(skills[0]?.path, projectHelpDir);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
      await rm(qwenHomeRoot, { recursive: true, force: true });
    }
  });
  it("detects overlapping legacy and canonical user skill roots including content mismatches", async () => {
    const homeRoot = await mkdtemp(join(tmpdir(), "omq-paths-home-"));
    const qwenHomeRoot = join(homeRoot, ".qwen");
    const legacyRoot = join(homeRoot, ".agents", "skills");
    process.env.HOME = homeRoot;
    process.env.QWEN_HOME = qwenHomeRoot;

    try {
      const canonicalHelpDir = join(qwenHomeRoot, "skills", "help");
      const canonicalPlanDir = join(qwenHomeRoot, "skills", "plan");
      const legacyHelpDir = join(legacyRoot, "help");
      const legacyOnlyDir = join(legacyRoot, "legacy-only");

      await mkdir(canonicalHelpDir, { recursive: true });
      await mkdir(canonicalPlanDir, { recursive: true });
      await mkdir(legacyHelpDir, { recursive: true });
      await mkdir(legacyOnlyDir, { recursive: true });

      await writeFile(join(canonicalHelpDir, "SKILL.md"), "# canonical help\n");
      await writeFile(join(canonicalPlanDir, "SKILL.md"), "# canonical plan\n");
      await writeFile(join(legacyHelpDir, "SKILL.md"), "# legacy help\n");
      await writeFile(join(legacyOnlyDir, "SKILL.md"), "# legacy only\n");

      const overlap = await detectLegacySkillRootOverlap();

      assert.equal(overlap.canonicalExists, true);
      assert.equal(overlap.legacyExists, true);
      assert.equal(overlap.canonicalSkillCount, 2);
      assert.equal(overlap.legacySkillCount, 2);
      assert.deepEqual(overlap.overlappingSkillNames, ["help"]);
      assert.deepEqual(overlap.mismatchedSkillNames, ["help"]);
    } finally {
      await rm(homeRoot, { recursive: true, force: true });
    }
  });
});

describe("omqStateDir", () => {
  it("uses provided projectRoot", () => {
    assert.equal(omqStateDir("/my/project"), "/my/project/.omq/state");
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(omqStateDir(), join(process.cwd(), ".omq", "state"));
  });
});

describe("omqProjectMemoryPath", () => {
  it("uses provided projectRoot", () => {
    assert.equal(
      omqProjectMemoryPath("/my/project"),
      "/my/project/.omq/project-memory.json",
    );
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(
      omqProjectMemoryPath(),
      join(process.cwd(), ".omq", "project-memory.json"),
    );
  });
});

describe("omqNotepadPath", () => {
  it("uses provided projectRoot", () => {
    assert.equal(omqNotepadPath("/my/project"), "/my/project/.omq/notepad.md");
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(omqNotepadPath(), join(process.cwd(), ".omq", "notepad.md"));
  });
});

describe("omqPlansDir", () => {
  it("uses provided projectRoot", () => {
    assert.equal(omqPlansDir("/my/project"), "/my/project/.omq/plans");
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(omqPlansDir(), join(process.cwd(), ".omq", "plans"));
  });
});

describe("omqLogsDir", () => {
  it("uses provided projectRoot", () => {
    assert.equal(omqLogsDir("/my/project"), "/my/project/.omq/logs");
  });

  it("defaults to cwd when no projectRoot given", () => {
    assert.equal(omqLogsDir(), join(process.cwd(), ".omq", "logs"));
  });
});

describe("packageRoot", () => {
  it("resolves to a directory containing package.json", () => {
    const root = packageRoot();
    assert.equal(existsSync(join(root, "package.json")), true);
  });
});
