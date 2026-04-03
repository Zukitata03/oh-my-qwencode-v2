/**
 * Model Configuration
 *
 * Reads per-mode model overrides and default-env overrides from .omq-config.json.
 *
 * Config format:
 * {
 *   "env": {
 *     "OMQ_DEFAULT_FRONTIER_MODEL": "your-frontier-model",
 *     "OMQ_DEFAULT_STANDARD_MODEL": "your-standard-model",
 *     "OMQ_DEFAULT_SPARK_MODEL": "your-spark-model"
 *   },
 *   "models": {
 *     "default": "o4-mini",
 *     "team": "gpt-4.1"
 *   }
 * }
 *
 * Resolution: mode-specific > "default" key > OMQ_DEFAULT_FRONTIER_MODEL > DEFAULT_FRONTIER_MODEL
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { qwenHome } from '../utils/paths.js';

export interface ModelsConfig {
  [mode: string]: string | undefined;
}

export interface OmqConfigEnv {
  [key: string]: string | undefined;
}

interface OmqConfigFile {
  env?: OmqConfigEnv;
  models?: ModelsConfig;
}

export const OMQ_DEFAULT_FRONTIER_MODEL_ENV = 'OMQ_DEFAULT_FRONTIER_MODEL';
export const OMQ_DEFAULT_STANDARD_MODEL_ENV = 'OMQ_DEFAULT_STANDARD_MODEL';
export const OMQ_DEFAULT_SPARK_MODEL_ENV = 'OMQ_DEFAULT_SPARK_MODEL';
export const OMQ_SPARK_MODEL_ENV = 'OMQ_SPARK_MODEL';

function readOmqConfigFile(qwenHomeOverride?: string): OmqConfigFile | null {
  const configPath = join(qwenHomeOverride || qwenHome(), '.omq-config.json');
  if (!existsSync(configPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    return raw as OmqConfigFile;
  } catch {
    return null;
  }
}

function readModelsBlock(qwenHomeOverride?: string): ModelsConfig | null {
  const config = readOmqConfigFile(qwenHomeOverride);
  if (!config) return null;
  if (config.models && typeof config.models === 'object' && !Array.isArray(config.models)) {
    return config.models;
  }
  return null;
}

export const DEFAULT_FRONTIER_MODEL = 'qwen3.6-plus';
export const DEFAULT_STANDARD_MODEL = 'qwen3.6-flash';
export const DEFAULT_SPARK_MODEL = 'qwen3.5-plus';

function normalizeConfiguredValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readConfigEnvValue(key: string, qwenHomeOverride?: string): string | undefined {
  const config = readOmqConfigFile(qwenHomeOverride);
  if (!config || !config.env || typeof config.env !== 'object' || Array.isArray(config.env)) {
    return undefined;
  }
  return normalizeConfiguredValue(config.env[key]);
}

function readTeamLowComplexityOverride(qwenHomeOverride?: string): string | undefined {
  const models = readModelsBlock(qwenHomeOverride);
  if (!models) return undefined;
  for (const key of TEAM_LOW_COMPLEXITY_MODEL_KEYS) {
    const value = normalizeConfiguredValue(models[key]);
    if (value) return value;
  }
  return undefined;
}

export function readConfiguredEnvOverrides(qwenHomeOverride?: string): NodeJS.ProcessEnv {
  const config = readOmqConfigFile(qwenHomeOverride);
  if (!config || !config.env || typeof config.env !== 'object' || Array.isArray(config.env)) {
    return {};
  }

  const resolved: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(config.env)) {
    const normalized = normalizeConfiguredValue(value);
    if (normalized) resolved[key] = normalized;
  }
  return resolved;
}

export function getEnvConfiguredMainDefaultModel(
  env: NodeJS.ProcessEnv = process.env,
  qwenHomeOverride?: string,
): string | undefined {
  return normalizeConfiguredValue(env[OMQ_DEFAULT_FRONTIER_MODEL_ENV])
    ?? readConfigEnvValue(OMQ_DEFAULT_FRONTIER_MODEL_ENV, qwenHomeOverride);
}

export function getEnvConfiguredStandardDefaultModel(
  env: NodeJS.ProcessEnv = process.env,
  qwenHomeOverride?: string,
): string | undefined {
  return normalizeConfiguredValue(env[OMQ_DEFAULT_STANDARD_MODEL_ENV])
    ?? readConfigEnvValue(OMQ_DEFAULT_STANDARD_MODEL_ENV, qwenHomeOverride);
}

export function getEnvConfiguredSparkDefaultModel(
  env: NodeJS.ProcessEnv = process.env,
  qwenHomeOverride?: string,
): string | undefined {
  return normalizeConfiguredValue(env[OMQ_DEFAULT_SPARK_MODEL_ENV])
    ?? normalizeConfiguredValue(env[OMQ_SPARK_MODEL_ENV])
    ?? readConfigEnvValue(OMQ_DEFAULT_SPARK_MODEL_ENV, qwenHomeOverride)
    ?? readConfigEnvValue(OMQ_SPARK_MODEL_ENV, qwenHomeOverride);
}

/**
 * Get the envvar-backed main/default model.
 * Resolution: OMQ_DEFAULT_FRONTIER_MODEL > DEFAULT_FRONTIER_MODEL
 */
export function getMainDefaultModel(qwenHomeOverride?: string): string {
  return getEnvConfiguredMainDefaultModel(process.env, qwenHomeOverride)
    ?? DEFAULT_FRONTIER_MODEL;
}

/**
 * Get the envvar-backed standard/default subagent model.
 * Resolution: OMQ_DEFAULT_STANDARD_MODEL > DEFAULT_STANDARD_MODEL
 */
export function getStandardDefaultModel(qwenHomeOverride?: string): string {
  return getEnvConfiguredStandardDefaultModel(process.env, qwenHomeOverride)
    ?? DEFAULT_STANDARD_MODEL;
}

/**
 * Get the configured model for a specific mode.
 * Resolution: mode-specific override > "default" key > OMQ_DEFAULT_FRONTIER_MODEL > DEFAULT_FRONTIER_MODEL
 */
export function getModelForMode(mode: string, qwenHomeOverride?: string): string {
  const models = readModelsBlock(qwenHomeOverride);
  const modeValue = normalizeConfiguredValue(models?.[mode]);
  if (modeValue) return modeValue;

  const defaultValue = normalizeConfiguredValue(models?.default);
  if (defaultValue) return defaultValue;

  return getMainDefaultModel(qwenHomeOverride);
}

const TEAM_LOW_COMPLEXITY_MODEL_KEYS = [
  'team_low_complexity',
  'team-low-complexity',
  'teamLowComplexity',
];

/**
 * Get the envvar-backed spark/low-complexity default model.
 * Resolution: OMQ_DEFAULT_SPARK_MODEL > OMQ_SPARK_MODEL > explicit low-complexity key(s) > DEFAULT_SPARK_MODEL
 */
export function getSparkDefaultModel(qwenHomeOverride?: string): string {
  return getEnvConfiguredSparkDefaultModel(process.env, qwenHomeOverride)
    ?? readTeamLowComplexityOverride(qwenHomeOverride)
    ?? DEFAULT_SPARK_MODEL;
}

/**
 * Get the low-complexity team worker model.
 * Resolution: explicit low-complexity key(s) > OMQ_DEFAULT_SPARK_MODEL > OMQ_SPARK_MODEL > DEFAULT_SPARK_MODEL
 */
export function getTeamLowComplexityModel(qwenHomeOverride?: string): string {
  return readTeamLowComplexityOverride(qwenHomeOverride) ?? getSparkDefaultModel(qwenHomeOverride);
}
