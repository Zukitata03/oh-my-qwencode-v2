import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function runOmq(cwd: string, argv: string[]) {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  return spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: process.env,
  });
}

describe('omq session help', () => {
  it('documents the session search command in help output', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-session-help-'));
    try {
      const mainHelp = runOmq(cwd, ['--help']);
      assert.equal(mainHelp.status, 0, mainHelp.stderr || mainHelp.stdout);
      assert.match(mainHelp.stdout, /omq resume\s+Resume a previous interactive Qwen Code session/i);
      assert.match(mainHelp.stdout, /omq autoresearch\s+Launch thin-supervisor autoresearch with keep\/discard\/reset parity/i);
      assert.match(mainHelp.stdout, /omq session\s+Search prior local session transcripts/i);

      const sessionHelp = runOmq(cwd, ['session', '--help']);
      assert.equal(sessionHelp.status, 0, sessionHelp.stderr || sessionHelp.stdout);
      assert.match(sessionHelp.stdout, /omq session search <query>/i);
      assert.match(sessionHelp.stdout, /--since <spec>/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
