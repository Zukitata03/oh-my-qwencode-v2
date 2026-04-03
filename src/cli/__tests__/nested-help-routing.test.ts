import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function runOmq(cwd: string, argv: string[]) {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  return spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      OMQ_AUTO_UPDATE: '0',
      OMQ_NOTIFY_FALLBACK: '0',
      OMQ_HOOK_DERIVED_SIGNALS: '0',
    },
  });
}

describe('nested help routing', () => {
  for (const [argv, expectedUsage] of [
    [['ask', '--help'], /Usage:\s*omq ask <claude\|gemini> <question or task>/i],
    [['autoresearch', '--help'], /Usage:[\s\S]*omq autoresearch <mission-dir>/i],
    [['hud', '--help'], /Usage:\s*\n\s*omq hud\s+Show current HUD state/i],
    [['hooks', '--help'], /Usage:\s*\n\s*omq hooks init/i],
    [['tmux-hook', '--help'], /Usage:\s*\n\s*omq tmux-hook init/i],
    [['ralph', '--help'], /omq ralph - Launch Qwen Code with ralph persistence mode active/i],
  ] satisfies Array<[string[], RegExp]>) {
    it(`routes ${argv.join(' ')} to command-local help`, async () => {
      const cwd = await mkdtemp(join(tmpdir(), 'omq-nested-help-'));
      try {
        const result = runOmq(cwd, argv);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.match(result.stdout, expectedUsage);
        assert.doesNotMatch(result.stdout, /oh-my-qwencode \(omq\) - Multi-agent orchestration for Qwen Code/i);
      } finally {
        await rm(cwd, { recursive: true, force: true });
      }
    });
  }
});
