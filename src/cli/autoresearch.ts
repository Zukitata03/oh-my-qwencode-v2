import { execFileSync, spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { ensureWorktree, planWorktreeTarget } from '../team/worktree.js';
import { loadAutoresearchMissionContract } from '../autoresearch/contracts.js';
import {
  countTrailingAutoresearchNoops,
  finalizeAutoresearchRunState,
  loadAutoresearchRunManifest,
  materializeAutoresearchMissionToWorktree,
  prepareAutoresearchRuntime,
  processAutoresearchCandidate,
  resumeAutoresearchRuntime,
  buildAutoresearchRunTag,
} from '../autoresearch/runtime.js';
import { assertModeStartAllowed } from '../modes/base.js';
import {
  buildAutoresearchDeepInterviewPrompt,
  initAutoresearchMission,
  materializeAutoresearchDeepInterviewResult,
  parseInitArgs,
} from './autoresearch-guided.js';
import {
  listAutoresearchDeepInterviewDraftPaths,
  listAutoresearchDeepInterviewResultPaths,
  resolveAutoresearchDeepInterviewResult,
} from './autoresearch-intake.js';
import { QWEN_BYPASS_FLAG, QWEN_BYPASS_VALUE, MADMAX_FLAG } from './constants.js';
import { restoreStandaloneHudPane, enableMouseScrolling } from '../team/tmux-session.js';

export const AUTORESEARCH_HELP = `omq autoresearch - Launch OMQ autoresearch with thin-supervisor parity semantics

Usage:
  omq autoresearch                                                (human entrypoint: launch Qwen Code deep-interview intake, then execute)
  omq autoresearch [--topic T] [--evaluator CMD] [--keep-policy P] [--slug S]
  omq autoresearch init [--topic T] [--evaluator CMD] [--keep-policy P] [--slug S]
  omq autoresearch run <mission-dir> [qwen-args...]              (agent/explicit execution entrypoint)
  omq autoresearch <mission-dir> [qwen-args...]                  (compatibility alias for run)
  omq autoresearch --resume <run-id> [qwen-args...]

Arguments:
  (no args)        Launch an interactive Qwen Code session that activates deep-interview --autoresearch,
                   writes .omq/specs artifacts, then launches only after explicit confirmation.
  --topic/...      Seed the deep-interview intake with draft values; still requires refinement/confirmation before launch.
  init             Bare init is an interactive deep-interview alias on TTYs; init with flags is the expert scaffold path.
  run              Execute a crystallized autoresearch mission, preferring tmux split-pane launch when available.
  <mission-dir>    Directory inside a git repository containing mission.md and sandbox.md
  <run-id>         Existing autoresearch run id from .omq/logs/autoresearch/<run-id>/manifest.json

Behavior:
  - deep-interview intake writes canonical artifacts under .omq/specs before launch
  - validates mission.md and sandbox.md
  - requires sandbox.md YAML frontmatter with evaluator.command and evaluator.format=json
  - fresh launch creates a run-tagged autoresearch/<slug>/<run-tag> lane
  - supervisor records baseline, candidate, keep/discard/reset, and results artifacts under .omq/logs/autoresearch/
  - run prefers interview|autoresearch split-pane launch inside tmux, with foreground fallback on failure
  - --resume loads the authoritative per-run manifest and continues from the last kept commit
`;

const AUTORESEARCH_APPEND_INSTRUCTIONS_ENV = 'OMQ_AUTORESEARCH_APPEND_INSTRUCTIONS_FILE';
const AUTORESEARCH_MAX_CONSECUTIVE_NOOPS = 3;

function buildAutoresearchDeepInterviewAppendix(): string {
  return [
    '<autoresearch_deep_interview_mode>',
    'You are in OMQ autoresearch intake mode.',
    'Run the deep-interview skill in autoresearch mode and clarify the research mission before launch.',
    'Do not start tmux, do not launch `omq autoresearch`, and do not bypass the user confirmation boundary.',
    'When the user confirms launch and the evaluator is concrete, persist canonical artifacts under `.omq/specs/` using the contracts in `src/cli/autoresearch-intake.ts`.',
    '- Required outputs: `deep-interview-autoresearch-{slug}.md`, `autoresearch-{slug}/mission.md`, `autoresearch-{slug}/sandbox.md`, `autoresearch-{slug}/result.json`.',
    '- If the evaluator is still a placeholder or the user wants to refine further, keep interviewing instead of finalizing launch-ready output.',
    '</autoresearch_deep_interview_mode>',
  ].join('\n');
}

async function writeAutoresearchDeepInterviewAppendixFile(repoRoot: string): Promise<string> {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const dir = join(repoRoot, '.omq', 'autoresearch');
  await mkdir(dir, { recursive: true });
  const path = join(dir, 'deep-interview-session-instructions.md');
  await writeFile(path, `${buildAutoresearchDeepInterviewAppendix()}\n`, 'utf-8');
  return path;
}

async function runGuidedAutoresearchDeepInterview(
  repoRoot: string,
  seedArgs?: ReturnType<typeof parseInitArgs>,
): Promise<Awaited<ReturnType<typeof initAutoresearchMission>>> {
  const previousInstructionsFile = process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV];
  const appendixPath = await writeAutoresearchDeepInterviewAppendixFile(repoRoot);
  const existingResultPaths = new Set(await listAutoresearchDeepInterviewResultPaths(repoRoot));
  const existingDraftPaths = new Set(await listAutoresearchDeepInterviewDraftPaths(repoRoot));
  process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV] = appendixPath;

  try {
    const { launchWithHud } = await import('./index.js');
    await launchWithHud([buildAutoresearchDeepInterviewPrompt(seedArgs ?? {})]);
  } finally {
    if (typeof previousInstructionsFile === 'string') {
      process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV] = previousInstructionsFile;
    } else {
      delete process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV];
    }
  }

  const result = await resolveAutoresearchDeepInterviewResult(repoRoot, {
    excludeResultPaths: existingResultPaths,
    excludeDraftPaths: existingDraftPaths,
  });
  if (!result) {
    throw new Error('autoresearch deep-interview did not produce .omq/specs launch artifacts.');
  }
  if (!result.launchReady) {
    throw new Error(
      `autoresearch deep-interview exited without a launch-ready result. ${result.blockedReasons.join(' ') || 'Refine the interview result and retry.'}`,
    );
  }
  return materializeAutoresearchDeepInterviewResult(result);
}

export function normalizeAutoresearchQwenArgs(qwenArgs: readonly string[]): string[] {
  const normalized: string[] = [];
  let hasBypass = false;
  let skipNextValue = false;

  for (let i = 0; i < qwenArgs.length; i++) {
    const arg = qwenArgs[i];
    
    if (skipNextValue) {
      skipNextValue = false;
      continue;
    }
    
    if (arg === MADMAX_FLAG) {
      if (!hasBypass) {
        normalized.push(QWEN_BYPASS_FLAG, QWEN_BYPASS_VALUE);
        hasBypass = true;
      }
      continue;
    }
    if (arg === QWEN_BYPASS_FLAG) {
      if (!hasBypass) {
        normalized.push(arg, QWEN_BYPASS_VALUE);
        hasBypass = true;
      }
      // Skip the 'yolo' value that follows --approval-mode
      if (qwenArgs[i + 1] === 'yolo') {
        skipNextValue = true;
      }
      continue;
    }
    // Skip 'yolo' if it's the value for --approval-mode (already added)
    if (arg === 'yolo' && hasBypass) {
      continue;
    }
    normalized.push(arg);
  }

  if (!hasBypass) {
    normalized.push(QWEN_BYPASS_FLAG, QWEN_BYPASS_VALUE);
  }

  return normalized;
}

function runAutoresearchTurn(worktreePath: string, instructionsFile: string, qwenArgs: string[]): void {
  const prompt = readFileSync(instructionsFile, 'utf-8');
  const launchArgs = ['exec', ...normalizeAutoresearchQwenArgs(qwenArgs), '-'];
  const result = spawnSync('qwen', launchArgs, {
    cwd: worktreePath,
    stdio: ['pipe', 'inherit', 'inherit'],
    input: prompt,
    encoding: 'utf-8',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = typeof result.status === 'number' ? result.status : 1;
    throw new Error(`autoresearch_qwen_exec_failed:${result.status ?? 'unknown'}`);
  }
}

export interface ParsedAutoresearchArgs {
  missionDir: string | null;
  runId: string | null;
  qwenArgs: string[];
  guided?: boolean;
  initArgs?: string[];
  seedArgs?: ReturnType<typeof parseInitArgs>;
  runSubcommand?: boolean;
}

function resolveRepoRoot(cwd: string): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function parseAutoresearchArgs(args: readonly string[]): ParsedAutoresearchArgs {
  const values = [...args];
  if (values.length === 0) {
    if (!process.stdin.isTTY) {
      throw new Error(`mission-dir is required.\n${AUTORESEARCH_HELP}`);
    }
    return { missionDir: null, runId: null, qwenArgs: [], guided: true };
  }

  const first = values[0];
  if (first === 'init') {
    return { missionDir: null, runId: null, qwenArgs: [], guided: true, initArgs: values.slice(1) };
  }
  if (first === '--help' || first === '-h' || first === 'help') {
    return { missionDir: '--help', runId: null, qwenArgs: [] };
  }
  if (first === '--resume') {
    const runId = values[1]?.trim();
    if (!runId) {
      throw new Error(`--resume requires <run-id>.\n${AUTORESEARCH_HELP}`);
    }
    return { missionDir: null, runId, qwenArgs: values.slice(2) };
  }
  if (first.startsWith('--resume=')) {
    const runId = first.slice('--resume='.length).trim();
    if (!runId) {
      throw new Error(`--resume requires <run-id>.\n${AUTORESEARCH_HELP}`);
    }
    return { missionDir: null, runId, qwenArgs: values.slice(1) };
  }
  if (first === 'run') {
    const missionDir = values[1]?.trim();
    if (!missionDir) {
      throw new Error(`run requires <mission-dir>.\n${AUTORESEARCH_HELP}`);
    }
    return { missionDir, runId: null, qwenArgs: values.slice(2), runSubcommand: true };
  }
  if (first.startsWith('-')) {
    const seedArgs = parseInitArgs(values);
    return { missionDir: null, runId: null, qwenArgs: [], guided: true, seedArgs };
  }
  return { missionDir: first, runId: null, qwenArgs: values.slice(1) };
}

async function runAutoresearchLoop(
  qwenArgs: string[],
  runtime: {
    instructionsFile: string;
    manifestFile: string;
    repoRoot: string;
    worktreePath: string;
  },
  missionDir: string,
): Promise<void> {
  const previousInstructionsFile = process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV];
  const originalCwd = process.cwd();
  process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV] = runtime.instructionsFile;

  try {
    while (true) {
      runAutoresearchTurn(runtime.worktreePath, runtime.instructionsFile, qwenArgs);

      const contract = await loadAutoresearchMissionContract(missionDir);
      const { run_id: runId } = JSON.parse(readFileSync(runtime.manifestFile, 'utf-8')) as { run_id: string };
      const manifest = await loadAutoresearchRunManifest(runtime.repoRoot, runId);
      const decision = await processAutoresearchCandidate(contract, manifest, runtime.repoRoot);
      if (decision === 'abort' || decision === 'error') {
        return;
      }
      if (decision === 'noop') {
        const trailingNoops = await countTrailingAutoresearchNoops(manifest.ledger_file);
        if (trailingNoops >= AUTORESEARCH_MAX_CONSECUTIVE_NOOPS) {
          await finalizeAutoresearchRunState(runtime.repoRoot, manifest.run_id, {
            status: 'stopped',
            stopReason: `repeated noop limit reached (${AUTORESEARCH_MAX_CONSECUTIVE_NOOPS})`,
          });
          return;
        }
      }
      process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV] = runtime.instructionsFile;
    }
  } finally {
    process.chdir(originalCwd);
    if (typeof previousInstructionsFile === 'string') {
      process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV] = previousInstructionsFile;
    } else {
      delete process.env[AUTORESEARCH_APPEND_INSTRUCTIONS_ENV];
    }
  }
}

function checkTmuxAvailable(): boolean {
  const result = spawnSync('tmux', ['-V'], { stdio: 'pipe' });
  return result.status === 0;
}

function tmuxDisplay(target: string, format: string): string | null {
  const result = spawnSync('tmux', ['display-message', '-p', '-t', target, format], { encoding: 'utf-8' });
  if (result.error || result.status !== 0) return null;
  const value = (result.stdout || '').trim();
  return value || null;
}

function listHudWatchPaneIdsInCurrentWindow(currentPaneId?: string): string[] {
  if (!currentPaneId) return [];
  const result = spawnSync(
    'tmux',
    ['list-panes', '-t', currentPaneId, '-F', '#{pane_id}\t#{pane_current_command}\t#{pane_start_command}'],
    { encoding: 'utf-8' },
  );
  if (result.error || result.status !== 0) return [];
  return (result.stdout || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter((parts) => parts.length >= 3)
    .map(([paneId = '', currentCommand = '', startCommand = '']) => ({ paneId, currentCommand, startCommand }))
    .filter((pane) => pane.paneId.startsWith('%'))
    .filter((pane) => pane.paneId !== currentPaneId)
    .filter((pane) => /\bomq\b.*\bhud\b.*--watch/i.test(pane.startCommand || ''))
    .map((pane) => pane.paneId);
}

function launchAutoresearchInSplitPane(args: {
  currentPaneId: string;
  repoRoot: string;
  missionDir: string;
  qwenArgs: string[];
}): boolean {
  if (!checkTmuxAvailable()) return false;

  const paneId = tmuxDisplay(args.currentPaneId, '#{pane_id}');
  if (!paneId) return false;
  const sessionName = tmuxDisplay(paneId, '#S');
  const currentCwd = tmuxDisplay(paneId, '#{pane_current_path}') || args.repoRoot;
  const existingHudPaneIds = listHudWatchPaneIdsInCurrentWindow(paneId);

  const omqPath = process.argv[1];
  if (!omqPath) return false;
  // Re-enter through the bare compatibility alias so the new pane executes immediately
  // instead of recursively taking the split-pane branch again.
  const launchArgs = ['autoresearch', args.missionDir, ...args.qwenArgs];
  const command = [process.execPath, omqPath, ...launchArgs]
    .map((part) => `'${part.replace(/'/g, `'\\''`)}'`)
    .join(' ');

  const split = spawnSync(
    'tmux',
    ['split-window', '-h', '-t', paneId, '-d', '-P', '-F', '#{pane_id}', '-c', currentCwd, command],
    { encoding: 'utf-8' },
  );
  if (split.error || split.status !== 0) {
    return false;
  }

  if (sessionName && process.env.OMQ_MOUSE !== '0') {
    enableMouseScrolling(sessionName);
  }
  if (existingHudPaneIds.length === 0) {
    restoreStandaloneHudPane(paneId, currentCwd);
  }
  console.log(`Autoresearch launched in split pane next to interview pane.`);
  return true;
}

async function executeAutoresearchMissionRun(missionDir: string, qwenArgs: string[]): Promise<void> {
  const contract = await loadAutoresearchMissionContract(missionDir);
  await assertModeStartAllowed('autoresearch', contract.repoRoot);
  const runTag = buildAutoresearchRunTag();
  const plan = planWorktreeTarget({
    cwd: contract.repoRoot,
    scope: 'autoresearch',
    mode: { enabled: true, detached: false, name: contract.missionSlug },
    worktreeTag: runTag,
  });
  const ensured = ensureWorktree(plan);
  if (!ensured.enabled) {
    throw new Error('autoresearch worktree planning unexpectedly disabled');
  }

  const worktreeContract = await materializeAutoresearchMissionToWorktree(contract, ensured.worktreePath);
  const runtime = await prepareAutoresearchRuntime(worktreeContract, contract.repoRoot, ensured.worktreePath, { runTag });
  await runAutoresearchLoop(qwenArgs, runtime, worktreeContract.missionDir);
}

export async function autoresearchCommand(args: string[]): Promise<void> {
  const parsed = parseAutoresearchArgs(args);
  if (parsed.missionDir === '--help') {
    console.log(AUTORESEARCH_HELP);
    return;
  }

  if (parsed.guided) {
    const repoRoot = resolveRepoRoot(process.cwd());
    let result;
    if (parsed.initArgs && parsed.initArgs.length > 0) {
      const initOpts = parseInitArgs(parsed.initArgs);
      if (!initOpts.topic || !initOpts.evaluatorCommand || !initOpts.slug) {
        throw new Error(
          'init requires --topic, --evaluator, and --slug flags.\n'
          + 'Optional: --keep-policy (default: score_improvement)\n\n'
          + `${AUTORESEARCH_HELP}`,
        );
      }
      result = await initAutoresearchMission({
        topic: initOpts.topic,
        evaluatorCommand: initOpts.evaluatorCommand,
        keepPolicy: initOpts.keepPolicy || 'score_improvement',
        slug: initOpts.slug,
        repoRoot,
      });
    } else {
      result = await runGuidedAutoresearchDeepInterview(repoRoot, parsed.seedArgs);
    }

    const currentPaneId = process.env.TMUX_PANE?.trim();
    if (currentPaneId && launchAutoresearchInSplitPane({
      currentPaneId,
      repoRoot,
      missionDir: result.missionDir,
      qwenArgs: [],
    })) {
      return;
    }

    await executeAutoresearchMissionRun(result.missionDir, []);
    return;
  }

  if (parsed.runId) {
    const repoRoot = resolveRepoRoot(process.cwd());
    await assertModeStartAllowed('autoresearch', repoRoot);
    const manifest = await loadAutoresearchRunManifest(repoRoot, parsed.runId);
    const runtime = await resumeAutoresearchRuntime(repoRoot, parsed.runId);
    await runAutoresearchLoop(parsed.qwenArgs, runtime, manifest.mission_dir);
    return;
  }

  if (parsed.runSubcommand) {
    const repoRoot = resolveRepoRoot(process.cwd());
    const currentPaneId = process.env.TMUX_PANE?.trim();
    if (currentPaneId && launchAutoresearchInSplitPane({
      currentPaneId,
      repoRoot,
      missionDir: parsed.missionDir as string,
      qwenArgs: parsed.qwenArgs,
    })) {
      return;
    }
  }

  await executeAutoresearchMissionRun(parsed.missionDir as string, parsed.qwenArgs);
}
