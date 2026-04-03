import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  isSparkShellNativeCompatibilityFailure,
  nestedRepoLocalSparkShellBinaryPath,
  packagedSparkShellBinaryCandidatePaths,
  parseSparkShellFallbackInvocation,
  repoLocalSparkShellBinaryPath,
  resolveSparkShellBinaryPath,
  resolveSparkShellBinaryPathWithHydration,
  runSparkShellBinary,
} from '../sparkshell.js';
import { buildCapturePaneArgv as buildNotificationCapturePaneArgv } from '../../notifications/tmux-detector.js';

function runOmq(
  cwd: string,
  argv: string[],
  envOverrides: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string; error?: string } {
  const testDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(testDir, '..', '..', '..');
  const omqBin = join(repoRoot, 'dist', 'cli', 'omq.js');
  const result = spawnSync('node', [omqBin, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...envOverrides },
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error?.message,
  };
}

function shouldSkipForSpawnPermissions(err?: string): boolean {
  return typeof err === 'string' && /(EPERM|EACCES)/i.test(err);
}

describe('resolveSparkShellBinaryPath', () => {
  it('prefers OMQ_SPARKSHELL_BIN override', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-override-'));
    try {
      const binary = join(cwd, 'bin', 'custom-sparkshell');
      assert.equal(
        resolveSparkShellBinaryPath({
          cwd,
          env: { OMQ_SPARKSHELL_BIN: './bin/custom-sparkshell' },
          packageRoot: '/unused',
        }),
        binary,
      );
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('falls back from packaged binary to repo-local build artifact', () => {
    const packageRoot = '/repo';
    const packaged = join(packageRoot, 'bin', 'native', `${process.platform}-${process.arch}`, process.platform === 'win32' ? 'omq-sparkshell.exe' : 'omq-sparkshell');
    const repoLocal = repoLocalSparkShellBinaryPath(packageRoot);

    assert.equal(
      resolveSparkShellBinaryPath({
        packageRoot,
        exists: (path) => path === repoLocal,
      }),
      repoLocal,
    );
    assert.notEqual(packaged, repoLocal);
  });

  it('checks Linux musl packaged paths before glibc and legacy paths', () => {
    assert.deepEqual(
      packagedSparkShellBinaryCandidatePaths('/repo', 'linux', 'x64', {}, ['musl', 'glibc']),
      [
        '/repo/bin/native/linux-x64-musl/omq-sparkshell',
        '/repo/bin/native/linux-x64-glibc/omq-sparkshell',
        '/repo/bin/native/linux-x64/omq-sparkshell',
      ],
    );
  });

  it('tries Linux musl packaged binaries before glibc fallbacks', () => {
    const packageRoot = '/repo';
    const seen: string[] = [];
    const glibcPath = '/repo/bin/native/linux-x64-glibc/omq-sparkshell';

    assert.equal(
      resolveSparkShellBinaryPath({
        packageRoot,
        platform: 'linux',
        arch: 'x64',
        linuxLibcPreference: ['musl', 'glibc'],
        exists: (path) => {
          seen.push(path);
          return path === glibcPath;
        },
      }),
      glibcPath,
    );
    assert.deepEqual(
      seen.slice(0, 2),
      [
        '/repo/bin/native/linux-x64-musl/omq-sparkshell',
        '/repo/bin/native/linux-x64-glibc/omq-sparkshell',
      ],
    );
  });

  it('falls back to nested repo-local native build artifact when present', () => {
    const packageRoot = '/repo';
    const nestedRepoLocal = nestedRepoLocalSparkShellBinaryPath(packageRoot);

    assert.equal(
      resolveSparkShellBinaryPath({
        packageRoot,
        exists: (path) => path === nestedRepoLocal,
      }),
      nestedRepoLocal,
    );
  });

  it('throws with checked paths when neither packaged nor repo-local binary exists', () => {
    assert.throws(
      () => resolveSparkShellBinaryPath({ packageRoot: '/repo', exists: () => false }),
      /native binary not found/,
    );
  });

  it('hydrates a native binary when packaged and repo-local binaries are absent', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-hydrated-'));
    try {
      const assetRoot = join(wd, 'assets');
      const cacheDir = join(wd, 'cache');
      const stagingDir = join(wd, 'staging');
      await mkdir(assetRoot, { recursive: true });
      await mkdir(stagingDir, { recursive: true });
      await writeFile(join(wd, 'package.json'), JSON.stringify({
        version: '0.8.15',
        repository: { url: 'git+https://github.com/Yeachan-Heo/oh-my-qwencode.git' },
      }));
      const stagedBinary = join(stagingDir, process.platform === 'win32' ? 'omq-sparkshell.exe' : 'omq-sparkshell');
      await writeFile(stagedBinary, process.platform === 'win32' ? '@echo off\r\necho hydrated\r\n' : '#!/bin/sh\necho hydrated\n');
      if (process.platform !== 'win32') await chmod(stagedBinary, 0o755);

      const archiveName = process.platform === 'win32'
        ? 'omq-sparkshell-x86_64-pc-windows-msvc.zip'
        : 'omq-sparkshell-x86_64-unknown-linux-musl.tar.gz';
      const archivePath = join(assetRoot, archiveName);
      const buildArchive = process.platform === 'win32'
        ? spawnSync('powershell', ['-NoLogo', '-NoProfile', '-Command', `Compress-Archive -Path '${stagedBinary.replace(/'/g, "''")}' -DestinationPath '${archivePath.replace(/'/g, "''")}' -Force`], { encoding: 'utf-8' })
        : spawnSync('tar', ['-czf', archivePath, '-C', stagingDir, 'omq-sparkshell'], { encoding: 'utf-8' });
      assert.equal(buildArchive.status, 0, buildArchive.stderr || buildArchive.stdout);
      const archiveBuffer = await readFile(archivePath);
      const checksum = createHash('sha256').update(archiveBuffer).digest('hex');

      const server = await new Promise<{ baseUrl: string; close: () => Promise<void> }>((resolve) => {
        const srv = createServer(async (req, res) => {
          const url = new URL(req.url || '/', 'http://127.0.0.1');
          const filePath = join(assetRoot, url.pathname.replace(/^\//, ''));
          try {
            res.writeHead(200);
            res.end(await readFile(filePath));
          } catch {
            res.writeHead(404);
            res.end('missing');
          }
        });
        srv.listen(0, '127.0.0.1', () => {
          const address = srv.address();
          if (!address || typeof address === 'string') throw new Error('bad address');
          resolve({
            baseUrl: `http://127.0.0.1:${address.port}`,
            close: () => new Promise<void>((done, reject) => srv.close((err: Error | undefined) => err ? reject(err) : done())),
          });
        });
      });

      try {
        await writeFile(join(assetRoot, 'native-release-manifest.json'), JSON.stringify({
          version: '0.8.15',
          assets: [{
            product: 'omq-sparkshell',
            version: '0.8.15',
            platform: process.platform === 'win32' ? 'win32' : 'linux',
            arch: 'x64',
            archive: archiveName,
            binary: process.platform === 'win32' ? 'omq-sparkshell.exe' : 'omq-sparkshell',
            binary_path: process.platform === 'win32' ? 'omq-sparkshell.exe' : 'omq-sparkshell',
            sha256: checksum,
            size: archiveBuffer.length,
            download_url: `${server.baseUrl}/${archiveName}`,
          }],
        }, null, 2));

        const resolved = await resolveSparkShellBinaryPathWithHydration({
          packageRoot: wd,
          platform: process.platform === 'win32' ? 'win32' : 'linux',
          arch: 'x64',
          env: {
            OMQ_NATIVE_MANIFEST_URL: `${server.baseUrl}/native-release-manifest.json`,
            OMQ_NATIVE_CACHE_DIR: cacheDir,
          },
          exists: () => false,
        });
        assert.match(resolved, /cache/);
      } finally {
        await server.close();
      }
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('falls back cleanly when hydration manifest is unavailable', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-hydration-missing-'));
    try {
      const missingRoot = join(wd, 'missing-assets');
      await mkdir(missingRoot, { recursive: true });
      await writeFile(join(wd, 'package.json'), JSON.stringify({
        version: '0.8.15',
        repository: { url: 'git+https://github.com/Yeachan-Heo/oh-my-qwencode.git' },
      }));

      const server = await new Promise<{ baseUrl: string; close: () => Promise<void> }>((resolve) => {
        const srv = createServer((_req, res) => {
          res.writeHead(404);
          res.end('missing');
        });
        srv.listen(0, '127.0.0.1', () => {
          const address = srv.address();
          if (!address || typeof address === 'string') throw new Error('bad address');
          resolve({
            baseUrl: `http://127.0.0.1:${address.port}`,
            close: () => new Promise<void>((done, reject) => srv.close((err: Error | undefined) => err ? reject(err) : done())),
          });
        });
      });

      try {
        await assert.rejects(
          () => resolveSparkShellBinaryPathWithHydration({
            packageRoot: wd,
            platform: process.platform === 'win32' ? 'win32' : 'linux',
            arch: 'x64',
            env: {
              OMQ_NATIVE_MANIFEST_URL: `${server.baseUrl}/native-release-manifest.json`,
              OMQ_NATIVE_CACHE_DIR: join(wd, 'cache'),
            },
            exists: () => false,
          }),
          /native binary not found/,
        );
      } finally {
        await server.close();
      }
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});

describe('runSparkShellBinary', () => {
  it('passes argv directly to the native sidecar', () => {
    let invoked: { binaryPath: string; args: string[]; stdio: unknown } | undefined;
    runSparkShellBinary('/fake/omq-sparkshell', ['git', 'diff --stat', 'a|b'], {
      cwd: '/tmp/example',
      env: { TEST_ENV: '1' },
      spawnImpl: ((binaryPath: string, args: string[], options: { stdio?: unknown }) => {
        invoked = { binaryPath, args, stdio: options.stdio };
        return {
          pid: 1,
          output: [],
          stdout: null,
          stderr: null,
          status: 0,
          signal: null,
        };
      }) as unknown as typeof spawnSync,
    });

    assert.deepEqual(invoked, {
      binaryPath: '/fake/omq-sparkshell',
      args: ['git', 'diff --stat', 'a|b'],
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  });

  it('merges .omq-config.json env overrides behind explicit shell env', async () => {
    const qwenHome = await mkdtemp(join(tmpdir(), 'omq-sparkshell-config-env-'));
    await writeFile(join(qwenHome, '.omq-config.json'), JSON.stringify({
      env: {
        OMQ_DEFAULT_FRONTIER_MODEL: 'frontier-local',
        OMQ_DEFAULT_SPARK_MODEL: 'spark-local',
      },
    }));

    try {
      let invokedEnv: NodeJS.ProcessEnv | undefined;
      runSparkShellBinary('/fake/omq-sparkshell', ['git', 'status'], {
        cwd: qwenHome,
        env: {
          QWEN_HOME: qwenHome,
          OMQ_DEFAULT_FRONTIER_MODEL: 'frontier-shell',
        },
        spawnImpl: ((_: string, __: string[], options: { env?: NodeJS.ProcessEnv }) => {
          invokedEnv = options.env;
          return {
            pid: 1,
            output: [],
            stdout: null,
            stderr: null,
            status: 0,
            signal: null,
          };
        }) as unknown as typeof spawnSync,
      });

      assert.equal(invokedEnv?.OMQ_DEFAULT_FRONTIER_MODEL, 'frontier-shell');
      assert.equal(invokedEnv?.OMQ_DEFAULT_SPARK_MODEL, 'spark-local');
    } finally {
      await rm(qwenHome, { recursive: true, force: true });
    }
  });
});

describe('isSparkShellNativeCompatibilityFailure', () => {
  it('detects GLIBC symbol version failures from the native loader', () => {
    assert.equal(
      isSparkShellNativeCompatibilityFailure({
        pid: 1,
        output: [],
        stdout: '',
        stderr: "omq-sparkshell: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.39' not found\n",
        status: 1,
        signal: null,
      }),
      true,
    );
  });

  it('ignores non-compatibility stderr failures', () => {
    assert.equal(
      isSparkShellNativeCompatibilityFailure({
        pid: 1,
        output: [],
        stdout: '',
        stderr: 'omq sparkshell: summary unavailable (tmux failed)\n',
        status: 1,
        signal: null,
      }),
      false,
    );
  });
});

describe('parseSparkShellFallbackInvocation', () => {
  it('passes direct commands through unchanged', () => {
    assert.deepEqual(
      parseSparkShellFallbackInvocation(['git', 'log', '--oneline']),
      { kind: 'command', argv: ['git', 'log', '--oneline'] },
    );
  });

  it('matches the shared notification capture-pane argv contract', () => {
    const parsed = parseSparkShellFallbackInvocation(['--tmux-pane', '%12', '--tail-lines', '400']);
    assert.deepEqual(parsed, {
      kind: 'tmux-pane',
      argv: ['tmux', ...buildNotificationCapturePaneArgv('%12', 400)],
    });
  });

  it('converts tmux pane mode into capture-pane argv', () => {
    assert.deepEqual(
      parseSparkShellFallbackInvocation(['--tmux-pane', '%12', '--tail-lines', '400']),
      { kind: 'tmux-pane', argv: ['tmux', 'capture-pane', '-t', '%12', '-p', '-S', '-400'] },
    );
  });
});

describe('omq sparkshell', () => {
  it('includes sparkshell in top-level help output', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-help-'));
    try {
      const result = runOmq(cwd, ['--help']);
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /omq explore\s+Default read-only exploration entrypoint \(may adaptively use sparkshell backend\)/);
      assert.match(result.stdout, /omq sparkshell <command> \[args\.\.\.\]/);
      assert.match(result.stdout, /omq sparkshell --tmux-pane <pane-id> \[--tail-lines <100-1000>\]/);
      assert.match(result.stdout, /adaptive backend for qualifying read-only explore tasks/i);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('prints sparkshell usage when invoked with --help', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-subhelp-'));
    try {
      const result = runOmq(cwd, ['sparkshell', '--help']);
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /Usage: omq sparkshell <command> \[args\.\.\.\]/);
      assert.match(result.stdout, /or: omq sparkshell --tmux-pane <pane-id> \[--tail-lines <100-1000>\]/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('preserves child stdout, stderr, and exit code through the JS bridge', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-bridge-'));
    try {
      const binDir = join(cwd, 'bin');
      const stubPath = join(binDir, process.platform === 'win32' ? 'omq-sparkshell.cmd' : 'omq-sparkshell');
      await mkdir(binDir, { recursive: true });
      if (process.platform === 'win32') {
        await writeFile(
          stubPath,
          '@echo off\r\necho spark-stdout\r\n>&2 echo spark-stderr\r\nexit /b 7\r\n',
        );
      } else {
        await writeFile(
          stubPath,
          '#!/bin/sh\necho spark-stdout\necho spark-stderr 1>&2\nexit 7\n',
        );
        await chmod(stubPath, 0o755);
      }

      const result = runOmq(cwd, ['sparkshell', 'git', 'status'], {
        OMQ_SPARKSHELL_BIN: stubPath,
      });
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 7, result.stderr || result.stdout);
      assert.equal(result.stdout, 'spark-stdout\n');
      assert.equal(result.stderr, 'spark-stderr\n');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('falls back to raw execution when the packaged native binary is GLIBC-incompatible', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-glibc-fallback-'));
    try {
      const testDir = dirname(fileURLToPath(import.meta.url));
      const repoRoot = join(testDir, '..', '..', '..');
      const packageJson = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf-8')) as { version: string };
      const cacheDir = join(cwd, 'cache');
      const binDir = join(cacheDir, packageJson.version, `${process.platform}-${process.arch}`, 'omq-sparkshell');
      await mkdir(binDir, { recursive: true });
      const stubPath = join(binDir, process.platform === 'win32' ? 'omq-sparkshell.exe' : 'omq-sparkshell');
      await writeFile(
        stubPath,
        process.platform === 'win32'
          ? '@echo off\r\n>&2 echo omq-sparkshell: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.39\' not found\r\nexit /b 1\r\n'
          : "#!/bin/sh\necho \"omq-sparkshell: /lib/x86_64-linux-gnu/libc.so.6: version \\`GLIBC_2.39' not found\" 1>&2\nexit 1\n",
      );
      if (process.platform !== 'win32') await chmod(stubPath, 0o755);

      const result = runOmq(cwd, ['sparkshell', 'node', '-e', 'process.stdout.write("raw-fallback\\n")'], {
        OMQ_NATIVE_CACHE_DIR: cacheDir,
      });
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.equal(result.stdout, 'raw-fallback\n');
      assert.match(result.stderr, /GLIBC-incompatible/i);
      assert.doesNotMatch(result.stderr, /version `GLIBC_2\.39' not found/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('fails clearly when the configured native binary path does not exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'omq-sparkshell-missing-'));
    try {
      const missingBinary = join(cwd, 'bin', 'does-not-exist');
      const result = runOmq(cwd, ['sparkshell', 'ls'], {
        OMQ_SPARKSHELL_BIN: missingBinary,
      });
      if (shouldSkipForSpawnPermissions(result.error)) return;

      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.match(result.stderr, /failed to launch native binary: executable not found/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
