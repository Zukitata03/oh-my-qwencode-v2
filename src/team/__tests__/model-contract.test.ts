import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectInheritableTeamWorkerArgs,
  isLowComplexityAgentType,
  resolveAgentDefaultModel,
  resolveAgentReasoningEffort,
  resolveTeamWorkerLaunchArgs,
  TEAM_LOW_COMPLEXITY_DEFAULT_MODEL,
  resolveTeamLowComplexityDefaultModel,
} from '../model-contract.js';

function expectedLowComplexityModel(): string {
  return resolveTeamLowComplexityDefaultModel();
}

describe('team model contract', () => {
  it('collects inheritable bypass and model overrides (reasoning is ignored)', () => {
    assert.deepEqual(
      collectInheritableTeamWorkerArgs([
        '--approval-mode',
        'yolo',
        '-c',
        'model_reasoning_effort="xhigh"',
        '--model=gpt-5.3',
      ]),
      [
        '--approval-mode',
        'yolo',
        '--model',
        'gpt-5.3',
      ],
    );
  });

  it('keeps exactly one canonical model flag with precedence env > inherited > fallback', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--model env-a --model=env-b',
        inheritedArgs: ['--model', 'inherited-model'],
        fallbackModel: expectedLowComplexityModel(),
      }),
      ['--model', 'env-b'],
    );
  });

  it('uses inherited model when env model is absent', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--no-alt-screen',
        inheritedArgs: ['--model=inherited-model'],
      }),
      ['--no-alt-screen', '--model', 'inherited-model'],
    );
  });

  it('uses fallback model when env and inherited models are absent', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--no-alt-screen',
        inheritedArgs: ['--approval-mode', 'yolo'],
        fallbackModel: expectedLowComplexityModel(),
      }),
      ['--no-alt-screen', '--approval-mode', 'yolo', '--model', expectedLowComplexityModel()],
    );
  });

  it('drops orphan --model flag and emits exactly one canonical --model', () => {
    // Orphan --model with no following value must not leak into passthrough and cause duplicate flags
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--model',
        inheritedArgs: ['--model', 'inherited-model'],
      }),
      ['--model', 'inherited-model'],
    );
  });

  it('drops orphan --model mixed with other flags and does not emit duplicate flags', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--no-alt-screen --model',
        inheritedArgs: ['--model', 'sonic-model'],
      }),
      ['--no-alt-screen', '--model', 'sonic-model'],
    );
  });

  it('drops --model= with empty value and falls back to inherited model', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '--model=',
        inheritedArgs: ['--model', 'inherited-model'],
      }),
      ['--model', 'inherited-model'],
    );
  });

  it('silently ignores -c model_reasoning_effort as Qwen Code does not support CLI reasoning', () => {
    assert.deepEqual(
      resolveTeamWorkerLaunchArgs({
        existingRaw: '-c model_reasoning_effort="high"',
        inheritedArgs: ['--model', 'gpt-5'],
      }),
      ['--model', 'gpt-5'],
    );
  });

  it('detects low-complexity agent types', () => {
    assert.equal(isLowComplexityAgentType('explore'), true);
    assert.equal(isLowComplexityAgentType('writer'), false);
    assert.equal(isLowComplexityAgentType('style-reviewer'), true);
    assert.equal(isLowComplexityAgentType('executor'), false);
    assert.equal(isLowComplexityAgentType('executor-low'), true);
  });

  it('maps worker roles to default reasoning effort tiers', () => {
    assert.equal(resolveAgentReasoningEffort('explore'), 'low');
    assert.equal(resolveAgentReasoningEffort('executor'), 'high');
    assert.equal(resolveAgentReasoningEffort('architect'), 'high');
    assert.equal(resolveAgentReasoningEffort('does-not-exist'), undefined);
  });

  it('maps worker roles to explicit default model lanes', () => {
    assert.equal(resolveAgentDefaultModel('explore'), expectedLowComplexityModel());
    assert.equal(resolveAgentDefaultModel('writer'), 'qwen3.6-flash');
    assert.equal(resolveAgentDefaultModel('executor'), 'qwen3.6-plus');
    assert.equal(resolveAgentDefaultModel('architect'), 'qwen3.6-plus');
    assert.equal(resolveAgentDefaultModel('does-not-exist'), undefined);
  });
});

describe('resolveTeamWorkerLaunchArgs - teammate model allocation', () => {
  it('does not inject reasoning via CLI as Qwen Code does not support it', () => {
    const result = resolveTeamWorkerLaunchArgs({
      fallbackModel: expectedLowComplexityModel(),
      preferredReasoning: 'low',
    });
    // Reasoning is not passed via CLI - users should configure in settings.json
    assert.deepEqual(
      result,
      ['--model', expectedLowComplexityModel()],
    );
  });

  it('does not auto-inject thinking level for fallback model when no preference is provided', () => {
    const result = resolveTeamWorkerLaunchArgs({
      fallbackModel: expectedLowComplexityModel(),
    });
    const joined = result.join(' ');
    assert.ok(!joined.includes('model_reasoning_effort'), `Expected no auto-injected thinking level in: ${joined}`);
  });

  it('silently ignores explicit reasoning override as Qwen Code does not support CLI reasoning', () => {
    const result = resolveTeamWorkerLaunchArgs({
      existingRaw: '-c model_reasoning_effort="high"',
      fallbackModel: expectedLowComplexityModel(),
      preferredReasoning: 'low',
    });
    const joined = result.join(' ');
    // Should NOT contain reasoning as it's silently ignored
    assert.ok(!joined.includes('model_reasoning_effort'), `Expected no reasoning in: ${joined}`);
  });

  it('does not inject thinking when model is explicit but reasoning is omitted', () => {
    const result = resolveTeamWorkerLaunchArgs({
      existingRaw: '--model claude-opus-4',
    });
    const joined = result.join(' ');
    assert.ok(!joined.includes('model_reasoning_effort'), `Expected no reasoning in: ${joined}`);
  });
});
