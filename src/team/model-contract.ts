import { getAgent } from '../agents/definitions.js';
import {
  DEFAULT_SPARK_MODEL,
  getMainDefaultModel,
  getSparkDefaultModel,
  getStandardDefaultModel,
} from '../config/models.js';

const MADMAX_FLAG = '--madmax';
const QWEN_BYPASS_FLAG = '--approval-mode';
const QWEN_BYPASS_VALUE = 'yolo';
const MODEL_FLAG = '--model';
const CONFIG_FLAG = '-c';
const REASONING_KEY = 'model_reasoning_effort';

const LOW_COMPLEXITY_AGENT_TYPES = new Set([
  'explore',
  'explorer',
  'style-reviewer',
]);

// Canonical default only; effective low-complexity resolution flows through resolveTeamLowComplexityDefaultModel().
export const TEAM_LOW_COMPLEXITY_DEFAULT_MODEL = DEFAULT_SPARK_MODEL;
export type TeamReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh';

export interface ParsedTeamWorkerLaunchArgs {
  passthrough: string[];
  wantsBypass: boolean;
  reasoningOverride: string | null;
  modelOverride: string | null;
}

export interface ResolveTeamWorkerLaunchArgsOptions {
  existingRaw?: string;
  inheritedArgs?: string[];
  fallbackModel?: string;
  preferredReasoning?: TeamReasoningEffort;
}

function isReasoningOverride(value: string): boolean {
  return new RegExp(`^${REASONING_KEY}\\s*=`).test(value.trim());
}

function isValidModelValue(value: string): boolean {
  return value.trim().length > 0 && !value.startsWith('-');
}

function normalizeOptionalModel(model?: string | null): string | undefined {
  if (typeof model !== 'string') return undefined;
  const trimmed = model.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalReasoning(reasoning?: TeamReasoningEffort | string | null): TeamReasoningEffort | undefined {
  if (typeof reasoning !== 'string') return undefined;
  const normalized = reasoning.trim().toLowerCase();
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high' || normalized === 'xhigh') {
    return normalized;
  }
  return undefined;
}

export function splitWorkerLaunchArgs(raw: string | undefined): string[] {
  if (!raw || raw.trim() === '') return [];
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseTeamWorkerLaunchArgs(args: string[]): ParsedTeamWorkerLaunchArgs {
  const passthrough: string[] = [];
  let wantsBypass = false;
  let reasoningOverride: string | null = null;
  let modelOverride: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === QWEN_BYPASS_FLAG || arg === MADMAX_FLAG) {
      wantsBypass = true;
      // Check if next arg is 'yolo' (the value for --approval-mode)
      if (args[i + 1] === 'yolo') {
        i += 1;
      }
      continue;
    }

    if (arg === MODEL_FLAG) {
      const maybeValue = args[i + 1];
      if (typeof maybeValue === 'string' && isValidModelValue(maybeValue)) {
        modelOverride = maybeValue.trim();
        i += 1;
      }
      // Orphan --model with no valid value is silently dropped (never passthrough)
      continue;
    }

    if (arg.startsWith(`${MODEL_FLAG}=`)) {
      const inlineValue = arg.slice(`${MODEL_FLAG}=`.length).trim();
      if (isValidModelValue(inlineValue)) {
        modelOverride = inlineValue;
      }
      // --model= with empty/invalid value is silently dropped (never passthrough)
      continue;
    }

    if (arg === CONFIG_FLAG) {
      const maybeValue = args[i + 1];
      if (typeof maybeValue === 'string' && isReasoningOverride(maybeValue)) {
        reasoningOverride = maybeValue;
        i += 1;
        continue;
      }
    }

    passthrough.push(arg);
  }

  return {
    passthrough,
    wantsBypass,
    reasoningOverride,
    modelOverride,
  };
}

export function collectInheritableTeamWorkerArgs(qwenArgs: string[]): string[] {
  const parsed = parseTeamWorkerLaunchArgs(qwenArgs);

  const inherited: string[] = [];
  if (parsed.wantsBypass) {
    inherited.push(QWEN_BYPASS_FLAG, QWEN_BYPASS_VALUE);
  }
  if (parsed.reasoningOverride) inherited.push(CONFIG_FLAG, parsed.reasoningOverride);
  if (parsed.modelOverride) inherited.push(MODEL_FLAG, parsed.modelOverride);
  return inherited;
}

export function normalizeTeamWorkerLaunchArgs(
  args: string[],
  preferredModel?: string,
  preferredReasoning?: TeamReasoningEffort,
): string[] {
  const parsed = parseTeamWorkerLaunchArgs(args);
  const normalized = [...parsed.passthrough];

  if (parsed.wantsBypass) {
    normalized.push(QWEN_BYPASS_FLAG, QWEN_BYPASS_VALUE);
  }

  const selectedReasoning = parsed.reasoningOverride
    ?? (normalizeOptionalReasoning(preferredReasoning)
      ? `${REASONING_KEY}="${normalizeOptionalReasoning(preferredReasoning)}"`
      : null);
  if (selectedReasoning) normalized.push(CONFIG_FLAG, selectedReasoning);

  const selectedModel = normalizeOptionalModel(preferredModel) ?? normalizeOptionalModel(parsed.modelOverride);
  if (selectedModel) normalized.push(MODEL_FLAG, selectedModel);

  return normalized;
}

export function resolveTeamWorkerLaunchArgs(options: ResolveTeamWorkerLaunchArgsOptions): string[] {
  const envArgs = splitWorkerLaunchArgs(options.existingRaw);
  const inheritedArgs = options.inheritedArgs ?? [];
  const allArgs = [...envArgs, ...inheritedArgs];

  const envModel = normalizeOptionalModel(parseTeamWorkerLaunchArgs(envArgs).modelOverride);
  const inheritedModel = normalizeOptionalModel(parseTeamWorkerLaunchArgs(inheritedArgs).modelOverride);
  const fallbackModel = normalizeOptionalModel(options.fallbackModel);
  const selectedModel = envModel ?? inheritedModel ?? fallbackModel;
  return normalizeTeamWorkerLaunchArgs(allArgs, selectedModel, options.preferredReasoning);
}

export function resolveAgentReasoningEffort(agentType?: string): TeamReasoningEffort | undefined {
  if (typeof agentType !== 'string' || agentType.trim() === '') return undefined;
  return normalizeOptionalReasoning(getAgent(agentType)?.reasoningEffort);
}

export function resolveAgentDefaultModel(
  agentType?: string,
  qwenHomeOverride?: string,
): string | undefined {
  if (typeof agentType !== 'string' || agentType.trim() === '') return undefined;
  const normalized = agentType.trim().toLowerCase();
  if (normalized === '') return undefined;
  if (normalized.endsWith('-low')) return resolveTeamLowComplexityDefaultModel(qwenHomeOverride);
  if (normalized === 'executor') return getMainDefaultModel(qwenHomeOverride);

  switch (getAgent(normalized)?.modelClass) {
    case 'fast':
      return resolveTeamLowComplexityDefaultModel(qwenHomeOverride);
    case 'frontier':
      return getMainDefaultModel(qwenHomeOverride);
    case 'standard':
      return getStandardDefaultModel(qwenHomeOverride);
    default:
      return undefined;
  }
}

export function isLowComplexityAgentType(agentType?: string): boolean {
  if (!agentType) return false;
  const normalized = agentType.trim().toLowerCase();
  if (normalized === '') return false;
  if (normalized.endsWith('-low')) return true;
  return LOW_COMPLEXITY_AGENT_TYPES.has(normalized);
}

export function resolveTeamLowComplexityDefaultModel(qwenHomeOverride?: string): string {
  return getSparkDefaultModel(qwenHomeOverride);
}
