import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chmod, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function runOmq(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string; error: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  const result = spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      OMQ_MODEL_INSTRUCTIONS_FILE: '',
      OMQ_TEAM_WORKER: '',
      OMQ_TEAM_STATE_ROOT: '',
      OMQ_TEAM_LEADER_CWD: '',
      ...envOverrides,
    },
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error?.message || '',
  };
}

describe('omq exec', () => {
  it('runs qwen exec with session-scoped instructions that preserve AGENTS and overlay content', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-exec-cli-'));
    try {
      const home = join(wd, 'home');
      const fakeBin = join(wd, 'bin');
      const fakeQwenPath = join(fakeBin, 'qwen');

      await mkdir(join(home, '.qwen'), { recursive: true });
      await mkdir(fakeBin, { recursive: true });
      await writeFile(join(home, '.qwen', 'AGENTS.md'), '# User Instructions\n\nGlobal guidance.\n');
      await writeFile(join(wd, 'AGENTS.md'), '# Project Instructions\n\nProject guidance.\n');
      await writeFile(
        fakeQwenPath,
        [
          '#!/bin/sh',
          'printf \'fake-qwen:%s\\n\' "$*"',
          'next_is_file=0',
          'for arg in "$@"; do',
          '  if [ "$next_is_file" = "1" ]; then',
          '    file=$(printf %s "$arg" | sed \'s/^See instructions in file: //\')',
          '    printf \'instructions-path:%s\\n\' "$file"',
          '    printf \'instructions-start\\n\'',
          '    cat "$file"',
          '    printf \'instructions-end\\n\'',
          '    next_is_file=0',
          '    continue',
          '  fi',
          '  case "$arg" in',
          '    --append-system-prompt)',
          '      next_is_file=1',
          '      ;;',
          '  esac',
          'done',
        ].join('\n'),
      );
      await chmod(fakeQwenPath, 0o755);

      const result = runOmq(wd, ['exec', '--model', 'gpt-5', 'say hi'], {
        HOME: home,
        NODE_OPTIONS: '',
        PATH: `${fakeBin}:/usr/bin:/bin`,
        OMQ_AUTO_UPDATE: '0',
        OMQ_NOTIFY_FALLBACK: '0',
        OMQ_HOOK_DERIVED_SIGNALS: '0',
      });

      assert.equal(result.status, 0, result.error || result.stderr || result.stdout);
      assert.match(result.stdout, /fake-qwen:exec --model gpt-5 say hi /);
      assert.match(result.stdout, /instructions-path:.*\/\.omq\/state\/sessions\/omq-.*\/AGENTS\.md/);
      assert.match(result.stdout, /instructions-start/);
      assert.match(result.stdout, /# User Instructions/);
      assert.match(result.stdout, /# Project Instructions/);
      assert.match(result.stdout, /<!-- OMQ:RUNTIME:START -->/);

      const sessionRoot = join(wd, '.omq', 'state', 'sessions');
      const sessionEntries = await readdir(sessionRoot);
      assert.equal(sessionEntries.length, 1);
      const sessionFiles = await readdir(join(sessionRoot, sessionEntries[0]));
      assert.equal(sessionFiles.includes('AGENTS.md'), false, 'session-scoped AGENTS file should be cleaned up after exec exits');
      assert.equal(existsSync(join(wd, '.omq', 'state', 'session.json')), false);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('passes exec --help through to qwen exec', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-exec-help-'));
    try {
      const home = join(wd, 'home');
      const fakeBin = join(wd, 'bin');
      const fakeQwenPath = join(fakeBin, 'qwen');

      await mkdir(home, { recursive: true });
      await mkdir(fakeBin, { recursive: true });
      await writeFile(fakeQwenPath, '#!/bin/sh\nprintf \'fake-qwen:%s\\n\' \"$*\"\n');
      await chmod(fakeQwenPath, 0o755);

      const result = runOmq(wd, ['exec', '--help'], {
        HOME: home,
        NODE_OPTIONS: '',
        PATH: `${fakeBin}:/usr/bin:/bin`,
        OMQ_AUTO_UPDATE: '0',
        OMQ_NOTIFY_FALLBACK: '0',
        OMQ_HOOK_DERIVED_SIGNALS: '0',
      });

      assert.equal(result.status, 0, result.error || result.stderr || result.stdout);
      assert.match(result.stdout, /fake-qwen:exec --help\b/);
      assert.doesNotMatch(result.stdout, /oh-my-qwencode \(omq\) - Multi-agent orchestration for Qwen Code/i);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
