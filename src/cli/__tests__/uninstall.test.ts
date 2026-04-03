import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function runOmq(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {}
): { status: number | null; stdout: string; stderr: string; error: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  const resolvedHome = envOverrides.HOME ?? process.env.HOME;
  const result = spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      ...(resolvedHome && !envOverrides.QWEN_HOME ? { QWEN_HOME: join(resolvedHome, '.qwen') } : {}),
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

function shouldSkipForSpawnPermissions(err: string): boolean {
  return typeof err === 'string' && /(EPERM|EACCES)/i.test(err);
}

/** Build a realistic OMQ config.toml for testing */
function buildOmqConfig(): string {
  return [
    '# oh-my-qwencode top-level settings (must be before any [table])',
    'notify = ["node", "/path/to/notify-hook.js"]',
    'model_reasoning_effort = "high"',
    'developer_instructions = "You have oh-my-qwencode installed."',
    '',
    '[features]',
    'multi_agent = true',
    'child_agents_md = true',
    '',
    '# ============================================================',
    '# oh-my-qwencode (OMQ) Configuration',
    '# Managed by omq setup - manual edits preserved on next setup',
    '# ============================================================',
    '',
    '# OMQ State Management MCP Server',
    '[mcp_servers.omq_state]',
    'command = "node"',
    'args = ["/path/to/state-server.js"]',
    'enabled = true',
    'startup_timeout_sec = 5',
    '',
    '# OMQ Project Memory MCP Server',
    '[mcp_servers.omq_memory]',
    'command = "node"',
    'args = ["/path/to/memory-server.js"]',
    'enabled = true',
    'startup_timeout_sec = 5',
    '',
    '# OMQ Code Intelligence MCP Server',
    '[mcp_servers.omq_code_intel]',
    'command = "node"',
    'args = ["/path/to/code-intel-server.js"]',
    'enabled = true',
    'startup_timeout_sec = 10',
    '',
    '# OMQ Trace MCP Server',
    '[mcp_servers.omq_trace]',
    'command = "node"',
    'args = ["/path/to/trace-server.js"]',
    'enabled = true',
    'startup_timeout_sec = 5',
    '',
    '[agents.executor]',
    'description = "Code implementation"',
    'config_file = "/path/to/executor.toml"',
    '',
    '# OMQ TUI StatusLine (Qwen Code v0.101.0+)',
    '[tui]',
    'status_line = ["model-with-reasoning", "git-branch"]',
    '',
    '# ============================================================',
    '# End oh-my-qwencode',
    '',
  ].join('\n');
}

/** Build a config with OMQ entries mixed with user entries */

function buildConfigWithSeededModelContext(): string {
  return [
    '# oh-my-qwencode top-level settings (must be before any [table])',
    'notify = ["node", "/path/to/notify-hook.js"]',
    'model_reasoning_effort = "high"',
    'developer_instructions = "You have oh-my-qwencode installed."',
    'model = "qwen3.6-plus"',
    'model_context_window = 1000000',
    'model_auto_compact_token_limit = 900000',
    '',
    '[features]',
    'multi_agent = true',
    'child_agents_md = true',
    '',
    '# ============================================================',
    '# oh-my-qwencode (OMQ) Configuration',
    '# Managed by omq setup - manual edits preserved on next setup',
    '# ============================================================',
    '',
    '[mcp_servers.omq_state]',
    'command = "node"',
    'args = ["/path/to/state-server.js"]',
    'enabled = true',
    '',
    '# ============================================================',
    '# End oh-my-qwencode',
    '',
  ].join('\n');
}

function buildMixedConfig(): string {
  return [
    '# User settings',
    'model = "o4-mini"',
    '',
    '# oh-my-qwencode top-level settings (must be before any [table])',
    'notify = ["node", "/path/to/notify-hook.js"]',
    'model_reasoning_effort = "high"',
    'developer_instructions = "You have oh-my-qwencode installed."',
    '',
    '[features]',
    'multi_agent = true',
    'child_agents_md = true',
    'web_search = true',
    '',
    '[mcp_servers.user_custom]',
    'command = "custom"',
    'args = ["--flag"]',
    '',
    '# ============================================================',
    '# oh-my-qwencode (OMQ) Configuration',
    '# Managed by omq setup - manual edits preserved on next setup',
    '# ============================================================',
    '',
    '[mcp_servers.omq_state]',
    'command = "node"',
    'args = ["/path/to/state-server.js"]',
    'enabled = true',
    '',
    '[mcp_servers.omq_memory]',
    'command = "node"',
    'args = ["/path/to/memory-server.js"]',
    'enabled = true',
    '',
    '[mcp_servers.omq_code_intel]',
    'command = "node"',
    'args = ["/path/to/code-intel-server.js"]',
    'enabled = true',
    '',
    '[mcp_servers.omq_trace]',
    'command = "node"',
    'args = ["/path/to/trace-server.js"]',
    'enabled = true',
    '',
    '[agents.executor]',
    'description = "Code implementation"',
    'config_file = "/path/to/executor.toml"',
    '',
    '[tui]',
    'status_line = ["model-with-reasoning"]',
    '',
    '# ============================================================',
    '# End oh-my-qwencode',
    '',
  ].join('\n');
}

describe('omq uninstall', () => {
  it('removes OMQ block from config.toml with --dry-run', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());

      const res = runOmq(wd, ['uninstall', '--dry-run'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /dry-run mode/);
      assert.match(res.stdout, /OMQ configuration block/);
      assert.match(res.stdout, /omq_state/);

      // Config should NOT have been modified
      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      assert.match(config, /oh-my-qwencode \(OMQ\) Configuration/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('removes OMQ block from config.toml', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /Removed OMQ configuration block/);

      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      assert.doesNotMatch(config, /oh-my-qwencode \(OMQ\) Configuration/);
      assert.doesNotMatch(config, /omq_state/);
      assert.doesNotMatch(config, /omq_memory/);
      assert.doesNotMatch(config, /omq_code_intel/);
      assert.doesNotMatch(config, /omq_trace/);
      assert.doesNotMatch(config, /\[agents\.executor\]/);
      assert.doesNotMatch(config, /\[tui\]/);
      assert.doesNotMatch(config, /notify\s*=/);
      assert.doesNotMatch(config, /model_reasoning_effort\s*=/);
      assert.doesNotMatch(config, /developer_instructions\s*=/);
      assert.doesNotMatch(config, /multi_agent\s*=/);
      assert.doesNotMatch(config, /child_agents_md\s*=/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });


  it('preserves user config entries when removing OMQ', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildMixedConfig());

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);

      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      // User settings preserved
      assert.match(config, /model = "o4-mini"/);
      assert.match(config, /\[mcp_servers\.user_custom\]/);
      assert.match(config, /web_search = true/);
      // OMQ entries removed
      assert.doesNotMatch(config, /omq_state/);
      assert.doesNotMatch(config, /omq_memory/);
      assert.doesNotMatch(config, /notify\s*=.*node/);
      assert.doesNotMatch(config, /multi_agent/);
      assert.doesNotMatch(config, /child_agents_md/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });


  it('preserves seeded model/context keys during uninstall', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildConfigWithSeededModelContext());

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);

      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      assert.match(config, /^model = "qwen3.6-plus"$/m);
      assert.match(config, /^model_context_window = 1000000$/m);
      assert.match(config, /^model_auto_compact_token_limit = 900000$/m);
      assert.doesNotMatch(config, /notify\s*=/);
      assert.doesNotMatch(config, /model_reasoning_effort\s*=/);
      assert.doesNotMatch(config, /developer_instructions\s*=/);
      assert.doesNotMatch(config, /oh-my-qwencode \(OMQ\) Configuration/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('--keep-config skips config.toml cleanup', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());

      const res = runOmq(wd, ['uninstall', '--keep-config'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /--keep-config/);

      // Config should NOT have been modified
      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      assert.match(config, /oh-my-qwencode \(OMQ\) Configuration/);
      assert.match(config, /omq_state/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('--purge removes .omq/ cache directory', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });
      // Create .omq/ directory with some files
      const omqDir = join(wd, '.omq');
      await mkdir(join(omqDir, 'state'), { recursive: true });
      await writeFile(join(omqDir, 'setup-scope.json'), JSON.stringify({ scope: 'user' }));
      await writeFile(join(omqDir, 'notepad.md'), '# notes');
      await writeFile(join(omqDir, 'state', 'ralph-state.json'), '{}');

      const res = runOmq(wd, ['uninstall', '--keep-config', '--purge'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /\.omq\/ cache directory/);

      assert.equal(existsSync(omqDir), false, '.omq/ directory should be removed');
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('works with project scope', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });

      // Create project-scoped setup
      const omqDir = join(wd, '.omq');
      const qwenDir = join(wd, '.qwen');
      await mkdir(omqDir, { recursive: true });
      await mkdir(join(qwenDir, 'prompts'), { recursive: true });
      await writeFile(join(omqDir, 'setup-scope.json'), JSON.stringify({ scope: 'project' }));
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());
      // Install a prompt
      await writeFile(join(qwenDir, 'prompts', 'executor.md'), '# executor');

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /Resolved scope: project/);

      // Project-local config.toml should be cleaned
      const config = await readFile(join(qwenDir, 'config.toml'), 'utf-8');
      assert.doesNotMatch(config, /oh-my-qwencode \(OMQ\) Configuration/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('handles missing config.toml gracefully', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /Nothing to remove/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('shows summary of what was removed', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /Uninstall summary/);
      assert.match(res.stdout, /MCP servers: omq_state, omq_memory, omq_code_intel, omq_trace/);
      assert.match(res.stdout, /Agent entries: 1/);
      assert.match(res.stdout, /TUI status line section/);
      assert.match(res.stdout, /Top-level keys/);
      assert.match(res.stdout, /Feature flags/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('--dry-run --purge does not actually remove .omq/ directory', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });
      const omqDir = join(wd, '.omq');
      await mkdir(join(omqDir, 'state'), { recursive: true });
      await writeFile(join(omqDir, 'setup-scope.json'), JSON.stringify({ scope: 'user' }));
      await writeFile(join(omqDir, 'notepad.md'), '# notes');

      const res = runOmq(wd, ['uninstall', '--keep-config', '--purge', '--dry-run'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(res.stdout, /dry-run mode/);
      assert.match(res.stdout, /\.omq\/ cache directory/);

      // .omq/ should still exist
      assert.equal(existsSync(omqDir), true, '.omq/ should NOT be removed in dry-run');
      assert.equal(existsSync(join(omqDir, 'notepad.md')), true);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('second uninstall run reports nothing to remove (idempotent)', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(join(qwenDir, 'config.toml'), buildOmqConfig());

      const first = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(first.error)) return;
      assert.equal(first.status, 0, first.stderr || first.stdout);
      assert.match(first.stdout, /Removed OMQ configuration block/);

      const second = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(second.error)) return;
      assert.equal(second.status, 0, second.stderr || second.stdout);
      assert.match(second.stdout, /Nothing to remove/);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('does not delete user AGENTS.md that merely mentions oh-my-qwencode', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });
      const userAgentsMd = '# My Agents\n\nDo not use oh-my-qwencode for this project.\n';
      await writeFile(join(wd, 'AGENTS.md'), userAgentsMd);

      const res = runOmq(wd, ['uninstall'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);

      // User AGENTS.md should be preserved
      assert.equal(existsSync(join(wd, 'AGENTS.md')), true);
      const content = await readFile(join(wd, 'AGENTS.md'), 'utf-8');
      assert.equal(content, userAgentsMd);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('removes managed user-scope AGENTS.md from QWEN_HOME', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      const qwenHome = join(home, '.qwen');
      await mkdir(qwenHome, { recursive: true });
      await mkdir(join(wd, '.omq'), { recursive: true });
      await writeFile(join(wd, '.omq', 'setup-scope.json'), JSON.stringify({ scope: 'user' }));
      await writeFile(
        join(qwenHome, 'AGENTS.md'),
        '<!-- AUTONOMY DIRECTIVE — DO NOT REMOVE -->\n'
          + 'YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION.\n'
          + 'DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROCEED. DO NOT WAIT FOR CONFIRMATION ON OBVIOUS NEXT STEPS.\n'
          + 'IF BLOCKED, TRY AN ALTERNATIVE APPROACH. ONLY ASK WHEN TRULY AMBIGUOUS OR DESTRUCTIVE.\n'
          + '<!-- END AUTONOMY DIRECTIVE -->\n'
          + '<!-- omq:generated:agents-md -->\n'
          + '# oh-my-qwencode - Intelligent Multi-Agent Orchestration\n',
      );

      const res = runOmq(wd, ['uninstall', '--keep-config'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.equal(existsSync(join(qwenHome, 'AGENTS.md')), false);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('removes setup-scope.json and hud-config.json without --purge', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-uninstall-'));
    try {
      const home = join(wd, 'home');
      await mkdir(home, { recursive: true });
      const omqDir = join(wd, '.omq');
      await mkdir(omqDir, { recursive: true });
      await writeFile(join(omqDir, 'setup-scope.json'), JSON.stringify({ scope: 'user' }));
      await writeFile(join(omqDir, 'hud-config.json'), JSON.stringify({ preset: 'focused' }));
      await writeFile(join(omqDir, 'notepad.md'), '# keep this');

      const res = runOmq(wd, ['uninstall', '--keep-config'], { HOME: home });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);

      assert.equal(existsSync(join(omqDir, 'setup-scope.json')), false);
      assert.equal(existsSync(join(omqDir, 'hud-config.json')), false);
      // notepad.md should still exist (not purged)
      assert.equal(existsSync(join(omqDir, 'notepad.md')), true);
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});

describe('stripOmqFeatureFlags', () => {
  it('removes OMQ feature flags and preserves user flags', async () => {
    const { stripOmqFeatureFlags } = await import('../../config/generator.js');

    const config = [
      '[features]',
      'multi_agent = true',
      'child_agents_md = true',
      'web_search = true',
      '',
    ].join('\n');

    const result = stripOmqFeatureFlags(config);
    assert.doesNotMatch(result, /multi_agent/);
    assert.doesNotMatch(result, /child_agents_md/);
    assert.match(result, /web_search = true/);
    assert.match(result, /\[features\]/);
  });

  it('removes [features] section if it becomes empty', async () => {
    const { stripOmqFeatureFlags } = await import('../../config/generator.js');

    const config = [
      '[features]',
      'multi_agent = true',
      'child_agents_md = true',
      '',
    ].join('\n');

    const result = stripOmqFeatureFlags(config);
    assert.doesNotMatch(result, /\[features\]/);
    assert.doesNotMatch(result, /multi_agent/);
  });

  it('handles config without [features] section', async () => {
    const { stripOmqFeatureFlags } = await import('../../config/generator.js');

    const config = 'model = "o4-mini"\n';
    const result = stripOmqFeatureFlags(config);
    assert.equal(result, config);
  });
});
