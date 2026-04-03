import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import type {
  HookPluginOmqHudState,
  HookPluginOmqNotifyFallbackState,
  HookPluginOmqSessionState,
  HookPluginOmqUpdateCheckState,
  HookPluginSdk,
} from '../types.js';
import { omqRootStateFilePath } from './paths.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readOmqStateFile<T extends Record<string, unknown>>(
  path: string,
  normalize?: (value: Record<string, unknown>) => T | null,
): Promise<T | null> {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(await readFile(path, 'utf-8')) as unknown;
    if (!isRecord(parsed)) return null;
    return normalize ? normalize(parsed) : parsed as T;
  } catch {
    return null;
  }
}

function normalizeSessionState(value: Record<string, unknown>): HookPluginOmqSessionState | null {
  return typeof value.session_id === 'string' && value.session_id.trim()
    ? value as HookPluginOmqSessionState
    : null;
}

export function createHookPluginOmqApi(cwd: string): HookPluginSdk['omq'] {
  return {
    session: {
      read: () => readOmqStateFile<HookPluginOmqSessionState>(
        omqRootStateFilePath(cwd, 'session.json'),
        normalizeSessionState,
      ),
    },
    hud: {
      read: () => readOmqStateFile<HookPluginOmqHudState>(
        omqRootStateFilePath(cwd, 'hud-state.json'),
      ),
    },
    notifyFallback: {
      read: () => readOmqStateFile<HookPluginOmqNotifyFallbackState>(
        omqRootStateFilePath(cwd, 'notify-fallback-state.json'),
      ),
    },
    updateCheck: {
      read: () => readOmqStateFile<HookPluginOmqUpdateCheckState>(
        omqRootStateFilePath(cwd, 'update-check.json'),
      ),
    },
  };
}
