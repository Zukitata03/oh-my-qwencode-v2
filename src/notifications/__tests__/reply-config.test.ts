import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const ENV_KEYS = [
  'QWEN_HOME',
  'OMQ_DISCORD_NOTIFIER_BOT_TOKEN',
  'OMQ_DISCORD_NOTIFIER_CHANNEL',
  'OMQ_REPLY_ENABLED',
  'OMQ_REPLY_DISCORD_USER_IDS',
  'OMQ_REPLY_POLL_INTERVAL_MS',
  'OMQ_REPLY_RATE_LIMIT',
] as const;

let qwenHomeDir = '';

function clearReplyEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

async function importConfigFresh(): Promise<typeof import('../config.js')> {
  const nonce = `${Date.now()}-${Math.random()}`;
  return await import(`../config.js?reply-test=${nonce}`);
}

describe('getReplyConfig validation', () => {
  beforeEach(async () => {
    clearReplyEnv();
    qwenHomeDir = await mkdtemp(join(tmpdir(), 'omq-reply-config-'));
    await mkdir(qwenHomeDir, { recursive: true });
    process.env.QWEN_HOME = qwenHomeDir;
  });

  afterEach(async () => {
    clearReplyEnv();
    if (qwenHomeDir) {
      await rm(qwenHomeDir, { recursive: true, force: true });
    }
  });

  it('clamps invalid env poll interval and rate limit', async () => {
    process.env.OMQ_DISCORD_NOTIFIER_BOT_TOKEN = 'bot-token';
    process.env.OMQ_DISCORD_NOTIFIER_CHANNEL = 'channel-id';
    process.env.OMQ_REPLY_ENABLED = 'true';
    process.env.OMQ_REPLY_DISCORD_USER_IDS = '12345678901234567';
    process.env.OMQ_REPLY_POLL_INTERVAL_MS = '0';
    process.env.OMQ_REPLY_RATE_LIMIT = '-2';

    const { getReplyConfig } = await importConfigFresh();
    const config = getReplyConfig();
    assert.ok(config);
    assert.equal(config.pollIntervalMs, 500);
    assert.equal(config.rateLimitPerMinute, 1);
  });

  it('normalizes invalid config file reply values', async () => {
    const configFile = join(qwenHomeDir, '.omq-config.json');
    const raw = {
      notifications: {
        enabled: true,
        'discord-bot': {
          enabled: true,
          botToken: 'cfg-token',
          channelId: 'cfg-channel',
        },
        reply: {
          enabled: true,
          pollIntervalMs: 5,
          rateLimitPerMinute: 0,
          maxMessageLength: 999999,
          authorizedDiscordUserIds: ['12345678901234567'],
        },
      },
    };
    await writeFile(configFile, JSON.stringify(raw, null, 2));

    const { getReplyConfig } = await importConfigFresh();
    const config = getReplyConfig();
    assert.ok(config);
    assert.equal(config.pollIntervalMs, 500);
    assert.equal(config.rateLimitPerMinute, 1);
    assert.equal(config.maxMessageLength, 4000);
  });
});
