import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { autoresearchCommand, normalizeAutoresearchQwenArgs, parseAutoresearchArgs } from '../autoresearch.js';

function withMockedTty<T>(fn: () => Promise<T>): Promise<T> {
  const descriptor = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');
  Object.defineProperty(process.stdin, 'isTTY', { configurable: true, value: true });
  return fn().finally(() => {
    if (descriptor) {
      Object.defineProperty(process.stdin, 'isTTY', descriptor);
    } else {
      Object.defineProperty(process.stdin, 'isTTY', { configurable: true, value: false });
    }
  });
}

function runOmq(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string; error?: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  const r = spawnSync(process.execPath, [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      OMQ_AUTO_UPDATE: '0',
      OMQ_NOTIFY_FALLBACK: '0',
      OMQ_HOOK_DERIVED_SIGNALS: '0',
      ...envOverrides,
    },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message };
}

async function initRepo(): Promise<string> {
  const raw = await mkdtemp(join(tmpdir(), 'omq-autoresearch-test-'));
  const cwd = realpathSync(raw);
  execFileSync('git', ['init'], { cwd, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.name', 'Test User'], { cwd, stdio: 'ignore' });
  await writeFile(join(cwd, 'README.md'), 'hello\n', 'utf-8');
  execFileSync('git', ['add', 'README.md'], { cwd, stdio: 'ignore' });
  execFileSync('git', ['commit', '-m', 'init'], { cwd, stdio: 'ignore' });
  return cwd;
}

describe('normalizeAutoresearchQwenArgs', () => {
  it('adds sandbox bypass by default for autoresearch workers', () => {
    assert.deepEqual(normalizeAutoresearchQwenArgs(['--model', 'gpt-5']), ['--model', 'gpt-5', '--approval-mode', 'yolo']);
  });

  it('deduplicates explicit bypass flags', () => {
    assert.deepEqual(normalizeAutoresearchQwenArgs(['--approval-mode', 'yolo']), ['--approval-mode', 'yolo']);
  });

  it('normalizes --madmax to the canonical bypass flag', () => {
    assert.deepEqual(normalizeAutoresearchQwenArgs(['--madmax']), ['--approval-mode', 'yolo']);
  });
});

describe('omq autoresearch', () => {
  it('documents autoresearch in top-level help', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-autoresearch-help-'));
    try {
      const result = runOmq(cwd, ['--help']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /omq autoresearch\s+Launch thin-supervisor autoresearch with keep\/discard\/reset parity/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('routes autoresearch --help to command-local help', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-autoresearch-local-help-'));
    try {
      const result = runOmq(cwd, ['autoresearch', '--help']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /Usage:[\s\S]*omq autoresearch run <mission-dir>/i);
      assert.match(result.stdout, /omq autoresearch init/i);
      assert.match(result.stdout, /--topic\/\.\.\./i);
      assert.match(result.stdout, /deep-interview/i);
      assert.match(result.stdout, /human entrypoint/i);
      assert.doesNotMatch(result.stdout, /oh-my-qwencode \(omq\) - Multi-agent orchestration for Qwen Code/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('documents --resume in command-local help', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-autoresearch-resume-help-'));
    try {
      const result = runOmq(cwd, ['autoresearch', '--help']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /--resume <run-id>/i);
      assert.match(result.stdout, /run-tagged/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('fails fast when mission dir is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-autoresearch-missing-arg-'));
    try {
      const result = runOmq(cwd, ['autoresearch']);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /mission-dir|Usage:\s*omq autoresearch <mission-dir>/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('treats top-level topic/evaluator flags as seeded deep-interview input', () => {
    const parsed = parseAutoresearchArgs(['--topic', 'Improve docs', '--evaluator', 'node eval.js', '--slug', 'docs-run']);
    assert.equal(parsed.guided, true);
    assert.equal(parsed.seedArgs?.topic, 'Improve docs');
    assert.equal(parsed.seedArgs?.evaluatorCommand, 'node eval.js');
    assert.equal(parsed.seedArgs?.slug, 'docs-run');
  });

  it('treats bare init as guided alias and init with flags as expert init args', () => {
    const bare = parseAutoresearchArgs(['init']);
    assert.equal(bare.guided, true);
    assert.deepEqual(bare.initArgs, []);

    const flagged = parseAutoresearchArgs(['init', '--topic', 'Ship feature']);
    assert.equal(flagged.guided, true);
    assert.deepEqual(flagged.initArgs, ['--topic', 'Ship feature']);
  });

  it('parses explicit run subcommand without breaking bare mission-dir execution', () => {
    const runParsed = parseAutoresearchArgs(['run', 'missions/demo', '--model', 'gpt-5']);
    assert.equal(runParsed.runSubcommand, true);
    assert.equal(runParsed.missionDir, 'missions/demo');
    assert.deepEqual(runParsed.qwenArgs, ['--model', 'gpt-5']);

    const bareParsed = parseAutoresearchArgs(['missions/demo', '--model', 'gpt-5']);
    assert.equal(bareParsed.runSubcommand, undefined);
    assert.equal(bareParsed.missionDir, 'missions/demo');
    assert.deepEqual(bareParsed.qwenArgs, ['--model', 'gpt-5']);
  });


  it('resolves guided deep-interview artifacts by seeded slug even when file mtimes predate launch timestamp', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-deep-interview-mtime-bin-'));
    try {
      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
if [ "$1" = "exec" ]; then
  candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
  head_commit=$(git rev-parse HEAD)
  cat >"$candidate_file" <<'EOF'
{
  "status": "abort",
  "candidate_commit": null,
  "base_commit": "HEAD_PLACEHOLDER",
  "description": "stop after guided handoff",
  "notes": ["fake qwen exec"],
  "created_at": "2026-03-18T00:00:00.000Z"
}
EOF
  perl -0pi -e "s/HEAD_PLACEHOLDER/$head_commit/g" "$candidate_file"
  exit 0
fi
mkdir -p "$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch"
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/deep-interview-autoresearch-test-launch.md" <<'EOF'
# Deep Interview Autoresearch Draft — test-launch

## Mission Draft
Investigate flaky onboarding behavior

## Evaluator Draft
node scripts/eval.js

## Keep Policy
score_improvement

## Session Slug
test-launch

## Seed Inputs
- topic: (none)
- evaluator: (none)
- keep_policy: (none)
- slug: (none)

## Launch Readiness
Launch-ready: yes
- Evaluator command is concrete and can be compiled into sandbox.md

## Confirmation Bridge
- refine further
- launch
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/mission.md" <<'EOF'
# Mission

Investigate flaky onboarding behavior
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/sandbox.md" <<'EOF'
---
evaluator:
  command: node scripts/eval.js
  format: json
  keep_policy: score_improvement
---
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/result.json" <<'EOF'
{
  "kind": "omq.autoresearch.deep-interview/v1",
  "compileTarget": {
    "topic": "Investigate flaky onboarding behavior",
    "evaluatorCommand": "node scripts/eval.js",
    "keepPolicy": "score_improvement",
    "slug": "test-launch",
    "repoRoot": "${repo}"
  },
  "draftArtifactPath": "${repo}/.omq/specs/deep-interview-autoresearch-test-launch.md",
  "missionArtifactPath": "${repo}/.omq/specs/autoresearch-test-launch/mission.md",
  "sandboxArtifactPath": "${repo}/.omq/specs/autoresearch-test-launch/sandbox.md",
  "launchReady": true,
  "blockedReasons": []
}
EOF
touch -t 202603180000 "$OMQ_TEST_REPO_ROOT/.omq/specs/deep-interview-autoresearch-test-launch.md"
touch -t 202603180000 "$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/mission.md"
touch -t 202603180000 "$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/sandbox.md"
touch -t 202603180000 "$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/result.json"
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const result = runOmq(repo, ['autoresearch', '--topic', 'Investigate flaky onboarding behavior', '--evaluator', 'node scripts/eval.js', '--slug', 'test-launch'], {
        PATH: `${fakeBin}:${process.env.PATH || ''}`,
        OMQ_TEST_REPO_ROOT: repo,
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const missionContent = await readFile(join(repo, 'missions', 'test-launch', 'mission.md'), 'utf-8');
      const sandboxContent = await readFile(join(repo, 'missions', 'test-launch', 'sandbox.md'), 'utf-8');
      assert.match(missionContent, /Investigate flaky onboarding behavior/);
      assert.match(sandboxContent, /command: node scripts\/eval\.js/);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('launches interactive deep-interview intake, materializes mission files, and then prefers split-pane handoff', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-deep-interview-bin-'));
    try {
      const qwenLog = join(repo, 'qwen-launch.log');
      const tmuxLog = join(repo, 'guided-tmux.log');
      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
printf '%s\n' "$*" >>"${qwenLog}"
if [ "$1" = "exec" ]; then
candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
head_commit=$(git rev-parse HEAD)
cat >"$candidate_file" <<'EOF'
{
  "status": "abort",
  "candidate_commit": null,
  "base_commit": "HEAD_PLACEHOLDER",
  "description": "stop after guided handoff",
  "notes": ["fake qwen exec"],
  "created_at": "2026-03-18T00:00:00.000Z"
}
EOF
perl -0pi -e "s/HEAD_PLACEHOLDER/$head_commit/g" "$candidate_file"
exit 0
fi
mkdir -p "$OMQ_TEST_REPO_ROOT/.omq/specs/deep-int"
mkdir -p "$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch"
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/deep-interview-autoresearch-test-launch.md" <<'EOF'
# Deep Interview Autoresearch Draft — test-launch

## Mission Draft
Investigate flaky onboarding behavior

## Evaluator Draft
node scripts/eval.js

## Keep Policy
score_improvement

## Session Slug
test-launch

## Seed Inputs
- topic: (none)
- evaluator: (none)
- keep_policy: (none)
- slug: (none)

## Launch Readiness
Launch-ready: yes
- Evaluator command is concrete and can be compiled into sandbox.md

## Confirmation Bridge
- refine further
- launch
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/mission.md" <<'EOF'
# Mission

Investigate flaky onboarding behavior
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/sandbox.md" <<'EOF'
---
evaluator:
  command: node scripts/eval.js
  format: json
  keep_policy: score_improvement
---
EOF
cat >"$OMQ_TEST_REPO_ROOT/.omq/specs/autoresearch-test-launch/result.json" <<'EOF'
{
  "kind": "omq.autoresearch.deep-interview/v1",
  "compileTarget": {
    "topic": "Investigate flaky onboarding behavior",
    "evaluatorCommand": "node scripts/eval.js",
    "keepPolicy": "score_improvement",
    "slug": "test-launch",
    "repoRoot": "${repo}"
  },
  "draftArtifactPath": "${repo}/.omq/specs/deep-interview-autoresearch-test-launch.md",
  "missionArtifactPath": "${repo}/.omq/specs/autoresearch-test-launch/mission.md",
  "sandboxArtifactPath": "${repo}/.omq/specs/autoresearch-test-launch/sandbox.md",
  "launchReady": true,
  "blockedReasons": []
}
EOF
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const fakeTmuxPath = join(fakeBin, 'tmux');
      await writeFile(
        fakeTmuxPath,
        `#!/bin/sh
printf '%s\n' "$*" >>"${tmuxLog}"
case "$1" in
  -V)
    printf 'tmux 3.4\n'
    exit 0
    ;;
  display-message)
    case "$*" in
      *"#{pane_id}"*) printf '%%42\n' ;;
      *"#{pane_current_path}"*) printf '%s\n' "$OMQ_TEST_REPO_ROOT" ;;
      *"#S"*) printf 'devsession\n' ;;
      *) printf 'devsession\n' ;;
    esac
    exit 0
    ;;
  list-panes)
    exit 0
    ;;
  split-window)
    last=""
    for arg in "$@"; do
      last="$arg"
    done
    printf '%%2\n'
    if printf '%s' "$last" | grep -q 'autoresearch '; then
      /bin/sh -lc "$last"
    fi
    exit 0
    ;;
  attach-session|set-option|set-hook|kill-session|kill-pane)
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeTmuxPath], { stdio: 'ignore' });

      const result = runOmq(repo, ['autoresearch', '--topic', 'Investigate flaky onboarding behavior', '--evaluator', 'node scripts/eval.js', '--slug', 'test-launch'], {
        PATH: `${fakeBin}:${process.env.PATH || ''}`,
        OMQ_TEST_REPO_ROOT: repo,
        TMUX: '/tmp/fake-tmux,12345,0',
        TMUX_PANE: '%42',
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const qwenArgs = await readFile(qwenLog, 'utf-8');
      const tmuxOutput = await readFile(tmuxLog, 'utf-8');
      assert.match(qwenArgs, /\$deep-interview --autoresearch/);
      assert.match(tmuxOutput, /split-window -h -t %42 -d -P -F #\{pane_id\} -c/);

      const missionContent = await readFile(join(repo, 'missions', 'test-launch', 'mission.md'), 'utf-8');
      const sandboxContent = await readFile(join(repo, 'missions', 'test-launch', 'sandbox.md'), 'utf-8');
      assert.match(missionContent, /Investigate flaky onboarding behavior/);
      assert.match(sandboxContent, /command: node scripts\/eval\.js/);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('uses split-window launch for explicit run inside tmux while preserving the interview pane', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-run-split-bin-'));
    try {
      const missionDir = join(repo, 'missions', 'demo');
      const tmuxLog = join(repo, 'tmux.log');
      await mkdir(missionDir, { recursive: true });
      await mkdir(join(repo, 'scripts'), { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\nSplit pane launch.\n', 'utf-8');
      await writeFile(
        join(missionDir, 'sandbox.md'),
        '---\nevaluator:\n  command: node scripts/eval.js\n  format: json\n  keep_policy: pass_only\n---\nStay inside the mission boundary.\n',
        'utf-8',
      );
      await writeFile(join(repo, 'scripts', 'eval.js'), "process.stdout.write(JSON.stringify({ pass: true }));\n", 'utf-8');
      execFileSync('git', ['add', '.'], { cwd: repo, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'add autoresearch mission'], { cwd: repo, stdio: 'ignore' });

      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
head_commit=$(git rev-parse HEAD)
cat >"$candidate_file" <<'EOF'
{
  "status": "abort",
  "candidate_commit": null,
  "base_commit": "HEAD_PLACEHOLDER",
  "description": "stop after split launch",
  "notes": ["fake qwen exec"],
  "created_at": "2026-03-18T00:00:00.000Z"
}
EOF
perl -0pi -e "s/HEAD_PLACEHOLDER/$head_commit/g" "$candidate_file"
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const fakeTmuxPath = join(fakeBin, 'tmux');
      await writeFile(
        fakeTmuxPath,
        `#!/bin/sh
printf '%s\n' "$*" >>"${tmuxLog}"
case "$1" in
  -V)
    printf 'tmux 3.4\n'
    exit 0
    ;;
  display-message)
    case "$*" in
      *"#{pane_id}"*) printf '%%9\n' ;;
      *"#{pane_current_path}"*) printf '${repo}\n' ;;
      *"#S"*) printf 'devsess\n' ;;
      *) printf '0\n' ;;
    esac
    exit 0
    ;;
  list-panes)
    printf '%%9\tzsh\tomq autoresearch\n'
    exit 0
    ;;
  split-window)
    last=""
    for arg in "$@"; do
      last="$arg"
    done
    if printf '%s' "$last" | grep -q 'hud --watch'; then
      printf '%%3\n'
      exit 0
    fi
    printf '%%2\n'
    /bin/sh -lc "$last"
    exit 0
    ;;
  set-option|select-pane)
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeTmuxPath], { stdio: 'ignore' });

      const result = runOmq(repo, ['autoresearch', 'run', missionDir, '--model', 'gpt-5'], {
        PATH: `${fakeBin}:${process.env.PATH || ''}`,
        OMQ_TEST_REPO_ROOT: repo,
        TMUX: '/tmp/fake-tmux,12345,0',
        TMUX_PANE: '%9',
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const tmuxOutput = await readFile(tmuxLog, 'utf-8');
      assert.match(tmuxOutput, /split-window -h -t %9 -d -P -F #\{pane_id\} -c/);
      assert.match(tmuxOutput, /'autoresearch' '\/tmp\/[^']+\/missions\/demo' '--model' 'gpt-5'/);
      assert.doesNotMatch(tmuxOutput, /kill-pane -t %9/);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('falls back to foreground execution when tmux split-window fails', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-run-fallback-bin-'));
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await mkdir(join(repo, 'scripts'), { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\nFallback launch.\n', 'utf-8');
      await writeFile(
        join(missionDir, 'sandbox.md'),
        '---\nevaluator:\n  command: node scripts/eval.js\n  format: json\n  keep_policy: pass_only\n---\nStay inside the mission boundary.\n',
        'utf-8',
      );
      await writeFile(join(repo, 'scripts', 'eval.js'), "process.stdout.write(JSON.stringify({ pass: true }));\n", 'utf-8');
      execFileSync('git', ['add', '.'], { cwd: repo, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'add autoresearch mission'], { cwd: repo, stdio: 'ignore' });

      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
head_commit=$(git rev-parse HEAD)
cat >"$candidate_file" <<'EOF'
{
  "status": "abort",
  "candidate_commit": null,
  "base_commit": "HEAD_PLACEHOLDER",
  "description": "stop after foreground fallback",
  "notes": ["fake qwen exec"],
  "created_at": "2026-03-18T00:00:00.000Z"
}
EOF
perl -0pi -e "s/HEAD_PLACEHOLDER/$head_commit/g" "$candidate_file"
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const fakeTmuxPath = join(fakeBin, 'tmux');
      await writeFile(
        fakeTmuxPath,
        `#!/bin/sh
case "$1" in
  -V)
    printf 'tmux 3.4\n'
    exit 0
    ;;
  display-message)
    case "$*" in
      *"#{pane_id}"*) printf '%%9\n' ;;
      *"#{pane_current_path}"*) printf '${repo}\n' ;;
      *"#S"*) printf 'devsess\n' ;;
      *) printf '0\n' ;;
    esac
    exit 0
    ;;
  list-panes)
    printf '%%9\tzsh\tomq autoresearch\n'
    exit 0
    ;;
  split-window)
    exit 1
    ;;
  set-option|select-pane)
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeTmuxPath], { stdio: 'ignore' });

      const result = runOmq(repo, ['autoresearch', 'run', missionDir], {
        PATH: `${fakeBin}:${process.env.PATH || ''}`,
        OMQ_TEST_REPO_ROOT: repo,
        TMUX: '/tmp/fake-tmux,12345,0',
        TMUX_PANE: '%9',
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const logsRoot = join(repo, '.omq', 'logs', 'autoresearch');
      const [runId] = readdirSync(logsRoot, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      assert.ok(runId);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('rejects mission directories outside a git repo', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-autoresearch-outside-git-'));
    try {
      await writeFile(join(cwd, 'mission.md'), '# Mission\n', 'utf-8');
      await writeFile(join(cwd, 'sandbox.md'), '---\nevaluator:\n  command: node eval.js\n---\n', 'utf-8');

      const result = runOmq(cwd, ['autoresearch', cwd]);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /git repo|git repository|inside a git repo/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('rejects missing mission.md inside an in-repo mission dir', async () => {
    const repo = await initRepo();
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await writeFile(join(missionDir, 'sandbox.md'), '---\nevaluator:\n  command: node eval.js\n---\n', 'utf-8');

      const result = runOmq(repo, ['autoresearch', missionDir]);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /mission\.md/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it('rejects missing sandbox.md inside an in-repo mission dir', async () => {
    const repo = await initRepo();
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\n', 'utf-8');

      const result = runOmq(repo, ['autoresearch', missionDir]);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /sandbox\.md/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it('rejects sandbox.md without evaluator frontmatter', async () => {
    const repo = await initRepo();
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\n', 'utf-8');
      await writeFile(join(missionDir, 'sandbox.md'), 'No frontmatter here.\n', 'utf-8');

      const result = runOmq(repo, ['autoresearch', missionDir]);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /frontmatter|evaluator/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it('rejects autoresearch launch when root ralph mode is already active', async () => {
    const repo = await initRepo();
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\n', 'utf-8');
      await writeFile(
        join(missionDir, 'sandbox.md'),
        '---\nevaluator:\n  command: node eval.js\n  format: json\n---\nStay inside the mission boundary.\n',
        'utf-8',
      );
      await mkdir(join(repo, '.omq', 'state'), { recursive: true });
      await writeFile(
        join(repo, '.omq', 'state', 'ralph-state.json'),
        JSON.stringify({
          active: true,
          mode: 'ralph',
          iteration: 0,
          max_iterations: 50,
          current_phase: 'executing',
          task_description: 'existing root ralph lane',
          started_at: '2026-03-14T00:00:00.000Z',
        }, null, 2),
        'utf-8',
      );

      const result = runOmq(repo, ['autoresearch', missionDir]);
      assert.notEqual(result.status, 0, result.stderr || result.stdout);
      assert.match(`${result.stderr}\n${result.stdout}`, /Cannot start autoresearch: ralph is already active/i);

      const worktreesRoot = join(repo, '.omq', 'worktrees');
      assert.equal(existsSync(worktreesRoot), false, 'expected launch to abort before creating autoresearch worktree');
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it('launches qwen exec for autoresearch turns without shelling out to cat', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-fake-bin-'));
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await mkdir(join(repo, 'scripts'), { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\nWrite a noop candidate artifact.\n', 'utf-8');
      await writeFile(
        join(missionDir, 'sandbox.md'),
        '---\nevaluator:\n  command: node scripts/eval.js\n  format: json\n  keep_policy: pass_only\n---\nStay inside the mission boundary.\n',
        'utf-8',
      );
      await writeFile(join(repo, 'scripts', 'eval.js'), "process.stdout.write(JSON.stringify({ pass: true }));\n", 'utf-8');
      execFileSync('git', ['add', '.'], { cwd: repo, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'add autoresearch mission'], { cwd: repo, stdio: 'ignore' });

      const fakeCatPath = join(fakeBin, 'cat');
      await writeFile(
        fakeCatPath,
        `#!/bin/sh
printf 'unexpected cat invocation\\n' >&2
exit 97
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeCatPath], { stdio: 'ignore' });

      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
printf 'fake-qwen:%s\\n' "$*" >&2
while IFS= read -r _; do
  :
done
candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
head_commit=$(git rev-parse HEAD)
printf '{\\n  "status": "abort",\\n  "candidate_commit": null,\\n  "base_commit": "%s",\\n  "description": "stop after first exec",\\n  "notes": ["fake qwen exec"],\\n  "created_at": "2026-03-15T00:00:00.000Z"\\n}\\n' "$head_commit" >"$candidate_file"
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const result = runOmq(
        repo,
        ['autoresearch', missionDir, '--approval-mode', 'yolo'],
        { PATH: `${fakeBin}:${process.env.PATH || ''}`, OMQ_TEST_REPO_ROOT: repo },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stderr, /fake-qwen:exec --approval-mode yolo -/);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });

  it('stops after repeated noop turns', async () => {
    const repo = await initRepo();
    const fakeBin = await mkdtemp(join(tmpdir(), 'omq-autoresearch-noop-bin-'));
    try {
      const missionDir = join(repo, 'missions', 'demo');
      await mkdir(missionDir, { recursive: true });
      await mkdir(join(repo, 'scripts'), { recursive: true });
      await writeFile(join(missionDir, 'mission.md'), '# Mission\nKeep returning noop.\n', 'utf-8');
      await writeFile(
        join(missionDir, 'sandbox.md'),
        '---\nevaluator:\n  command: node scripts/eval.js\n  format: json\n  keep_policy: pass_only\n---\nStay inside the mission boundary.\n',
        'utf-8',
      );
      await writeFile(join(repo, 'scripts', 'eval.js'), "process.stdout.write(JSON.stringify({ pass: true }));\n", 'utf-8');
      execFileSync('git', ['add', '.'], { cwd: repo, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'add autoresearch noop mission'], { cwd: repo, stdio: 'ignore' });

      const fakeQwenPath = join(fakeBin, 'qwen');
      await writeFile(
        fakeQwenPath,
        `#!/bin/sh
cat >/dev/null
candidate_file=$(find "$OMQ_TEST_REPO_ROOT/.omq/logs/autoresearch" -name candidate.json | head -n 1)
head_commit=$(git rev-parse HEAD)
cat >"$candidate_file" <<EOF
{
  "status": "noop",
  "candidate_commit": null,
  "base_commit": "$head_commit",
  "description": "noop from fake qwen exec",
  "notes": ["fake noop"],
  "created_at": "2026-03-15T00:00:00.000Z"
}
EOF
`,
        'utf-8',
      );
      execFileSync('chmod', ['+x', fakeQwenPath], { stdio: 'ignore' });

      const result = runOmq(
        repo,
        ['autoresearch', missionDir, '--approval-mode', 'yolo'],
        { PATH: `${fakeBin}:${process.env.PATH || ''}`, OMQ_TEST_REPO_ROOT: repo },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout);

      const state = JSON.parse(await readFile(join(repo, '.omq', 'state', 'autoresearch-state.json'), 'utf-8')) as {
        active: boolean;
      };
      assert.equal(state.active, false);

      const logsRoot = join(repo, '.omq', 'logs', 'autoresearch');
      const [runId] = readdirSync(logsRoot, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      assert.ok(runId);

      const manifest = JSON.parse(await readFile(join(logsRoot, runId, 'manifest.json'), 'utf-8')) as {
        status: string;
        stop_reason: string | null;
        completed_at: string | null;
      };
      assert.equal(manifest.status, 'stopped');
      assert.equal(manifest.stop_reason, 'repeated noop limit reached (3)');
      assert.match(manifest.completed_at || '', /^\d{4}-\d{2}-\d{2}T/);

      const ledger = JSON.parse(await readFile(join(logsRoot, runId, 'iteration-ledger.json'), 'utf-8')) as {
        entries: Array<{ decision: string }>;
      };
      assert.deepEqual(ledger.entries.map((entry) => entry.decision), ['baseline', 'noop', 'noop', 'noop']);

      const resumeResult = runOmq(repo, ['autoresearch', '--resume', runId]);
      assert.notEqual(resumeResult.status, 0, resumeResult.stderr || resumeResult.stdout);
      assert.match(`${resumeResult.stderr}\n${resumeResult.stdout}`, /autoresearch_resume_terminal_run/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
      await rm(fakeBin, { recursive: true, force: true });
    }
  });
});
