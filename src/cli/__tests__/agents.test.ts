import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function runOmq(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string; error?: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  const result = spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...envOverrides },
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error?.message,
  };
}

function shouldSkipForSpawnPermissions(err?: string): boolean {
  return typeof err === 'string' && /(EPERM|EACCES)/i.test(err);
}

describe('omq agents', () => {
  it('lists project and user native agents with name, description, and model', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-agents-cli-'));
    const home = join(wd, 'home');
    try {
      const projectAgentsDir = join(wd, '.qwen', 'agents');
      const userAgentsDir = join(home, '.qwen', 'agents');
      await mkdir(projectAgentsDir, { recursive: true });
      await mkdir(userAgentsDir, { recursive: true });

      await writeFile(
        join(projectAgentsDir, 'planner.toml'),
        'name = "planner"\ndescription = "Project planner"\nmodel = "qwen3.6-plus"\ndeveloper_instructions = """plan"""\n',
      );
      await writeFile(
        join(userAgentsDir, 'reviewer.toml'),
        'name = "reviewer"\ndescription = "User reviewer"\ndeveloper_instructions = """review"""\n',
      );

      const result = runOmq(wd, ['agents', 'list'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
      });
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /scope\s+name\s+model\s+description/i);
      assert.match(result.stdout, /project\s+planner\s+qwen3.6-plus\s+Project planner/);
      assert.match(result.stdout, /user\s+reviewer\s+-\s+User reviewer/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('adds a scaffolded agent TOML file with required fields and commented optional fields', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-agents-cli-'));
    const home = join(wd, 'home');
    try {
      await mkdir(home, { recursive: true });

      const result = runOmq(wd, ['agents', 'add', 'my-helper', '--scope', 'project'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
      });
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 0, result.stderr || result.stdout);
      const agentPath = join(wd, '.qwen', 'agents', 'my-helper.toml');
      assert.equal(existsSync(agentPath), true);

      const content = await readFile(agentPath, 'utf-8');
      assert.match(content, /^name = "my-helper"$/m);
      assert.match(content, /^description = "TODO: describe this agent's purpose"$/m);
      assert.match(content, /^developer_instructions = """$/m);
      assert.match(content, /^# model = "qwen3.6-plus"$/m);
      assert.match(content, /^# Note: model_reasoning_effort should be configured in ~\/.qwen\/settings.json$/m);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('edits an existing agent via $EDITOR and removes it with --force', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-agents-cli-'));
    const home = join(wd, 'home');
    try {
      const projectAgentsDir = join(wd, '.qwen', 'agents');
      await mkdir(projectAgentsDir, { recursive: true });
      await mkdir(home, { recursive: true });
      const agentPath = join(projectAgentsDir, 'editor-test.toml');
      await writeFile(
        agentPath,
        'name = "editor-test"\ndescription = "Before edit"\ndeveloper_instructions = """before"""\n',
      );

      const editorScript = join(wd, 'editor.sh');
      await writeFile(
        editorScript,
        '#!/usr/bin/env bash\nprintf \'\\nmodel = "qwen3.6-plus"\\n\' >> \"$1\"\n',
      );
      await chmod(editorScript, 0o755);

      const editResult = runOmq(wd, ['agents', 'edit', 'editor-test', '--scope', 'project'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
        EDITOR: editorScript,
      });
      if (shouldSkipForSpawnPermissions(editResult.error)) return;

      assert.equal(editResult.status, 0, editResult.stderr || editResult.stdout);
      assert.match(await readFile(agentPath, 'utf-8'), /^model = "qwen3.6-plus"$/m);

      const removeResult = runOmq(wd, ['agents', 'remove', 'editor-test', '--scope', 'project', '--force'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
      });
      if (shouldSkipForSpawnPermissions(removeResult.error)) return;

      assert.equal(removeResult.status, 0, removeResult.stderr || removeResult.stdout);
      assert.equal(existsSync(agentPath), false);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
