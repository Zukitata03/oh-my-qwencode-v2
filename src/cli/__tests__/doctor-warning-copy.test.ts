import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { withPackagedExploreHarnessHidden, withPackagedExploreHarnessLock } from './packaged-explore-harness-lock.js';

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
    env: { ...process.env, ...envOverrides },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message };
}

function shouldSkipForSpawnPermissions(err?: string): boolean {
  return typeof err === 'string' && /(EPERM|EACCES)/i.test(err);
}

describe('omq doctor onboarding warning copy', () => {
  it('explains first-setup expectation for config and MCP onboarding warnings', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-doctor-copy-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(
        join(qwenDir, 'config.toml'),
        `
[mcp_servers.non_omq]
command = "node"
`.trimStart(),
      );

      const res = runOmq(wd, ['doctor'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(
        res.stdout,
        /Config: config\.toml exists but no OMQ entries yet \(expected before first setup; run "omq setup --force" once\)/,
      );
      assert.match(
        res.stdout,
        /MCP Servers: 1 servers but no OMQ servers yet \(expected before first setup; run "omq setup --force" once\)/,
      );
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('warns when explore harness sources are packaged but cargo is unavailable', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-doctor-explore-copy-'));
    try {
      await withPackagedExploreHarnessHidden(async () => {
        const home = join(wd, 'home');
        const qwenDir = join(home, '.qwen');
        const fakeBin = join(wd, 'bin');
        await mkdir(qwenDir, { recursive: true });
        await mkdir(fakeBin, { recursive: true });
        await writeFile(join(fakeBin, 'qwen'), '#!/bin/sh\necho "qwen test"\n');
        spawnSync('chmod', ['+x', join(fakeBin, 'qwen')], { encoding: 'utf-8' });

        const res = runOmq(wd, ['doctor'], {
          HOME: home,
          QWEN_HOME: join(home, '.qwen'),
          PATH: fakeBin,
        });
        if (shouldSkipForSpawnPermissions(res.error)) return;
        assert.equal(res.status, 0, res.stderr || res.stdout);
        assert.match(
          res.stdout,
          /Explore Harness: (Rust harness sources are packaged, but no compatible packaged prebuilt or cargo was found \(install Rust or set OMQ_EXPLORE_BIN for omq explore\)|not ready \(no packaged binary, OMQ_EXPLORE_BIN, or cargo toolchain\))/,
        );
      });
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('passes explore harness check when a packaged native binary is present even without cargo', async () => {
    await withPackagedExploreHarnessLock(async () => {
      const wd = await mkdtemp(join(tmpdir(), 'omq-doctor-explore-binary-'));
      try {
        const home = join(wd, 'home');
        const qwenDir = join(home, '.qwen');
        const fakeBin = join(wd, 'bin');
        const packageBinDir = join(process.cwd(), 'bin');
        const packagedBinary = join(packageBinDir, process.platform === 'win32' ? 'omq-explore-harness.exe' : 'omq-explore-harness');
        const packagedMeta = join(packageBinDir, 'omq-explore-harness.meta.json');
        const hadExistingBinary = existsSync(packagedBinary);
        const hadExistingMeta = existsSync(packagedMeta);

        await mkdir(qwenDir, { recursive: true });
        await mkdir(fakeBin, { recursive: true });
        await writeFile(join(fakeBin, 'qwen'), '#!/bin/sh\necho "qwen test"\n');
        spawnSync('chmod', ['+x', join(fakeBin, 'qwen')], { encoding: 'utf-8' });
        const fsPromises = await import('node:fs/promises');
        const originalBinary = hadExistingBinary ? await fsPromises.readFile(packagedBinary) : null;
        const originalMeta = hadExistingMeta ? await fsPromises.readFile(packagedMeta, 'utf-8') : null;
        await mkdir(packageBinDir, { recursive: true });
        await writeFile(packagedBinary, '#!/bin/sh\necho "stub harness"\n');
        await writeFile(packagedMeta, JSON.stringify({ binaryName: process.platform === 'win32' ? 'omq-explore-harness.exe' : 'omq-explore-harness', platform: process.platform, arch: process.arch }));
        spawnSync('chmod', ['+x', packagedBinary], { encoding: 'utf-8' });

        try {
          const res = runOmq(wd, ['doctor'], {
            HOME: home,
            QWEN_HOME: join(home, '.qwen'),
            PATH: fakeBin,
          });
          if (shouldSkipForSpawnPermissions(res.error)) return;
          assert.equal(res.status, 0, res.stderr || res.stdout);
          assert.match(
            res.stdout,
            /Explore Harness: ready \(packaged native binary:/,
          );
        } finally {
          if (originalBinary) {
            await writeFile(packagedBinary, originalBinary);
            spawnSync('chmod', ['+x', packagedBinary], { encoding: 'utf-8' });
          } else {
            await rm(packagedBinary, { force: true });
          }
          if (originalMeta !== null) {
            await writeFile(packagedMeta, originalMeta);
          } else {
            await rm(packagedMeta, { force: true });
          }
        }
      } finally {
        await rm(wd, { recursive: true, force: true });
      }
    });
  });

  it('warns when explore routing is explicitly disabled in config.toml', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-doctor-explore-routing-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      await mkdir(qwenDir, { recursive: true });
      await writeFile(
        join(qwenDir, 'config.toml'),
        `
[env]
USE_OMQ_EXPLORE_CMD = "off"
`.trimStart(),
      );

      const res = runOmq(wd, ['doctor'], {
        HOME: home,
        QWEN_HOME: join(home, '.qwen'),
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(
        res.stdout,
        /Explore routing: disabled in config\.toml \[env\]; set USE_OMQ_EXPLORE_CMD = "1" to restore default explore-first routing/,
      );
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });

  it('warns when canonical and legacy skill roots overlap', async () => {
    const wd = await mkdtemp(join(tmpdir(), 'omq-doctor-skill-overlap-'));
    try {
      const home = join(wd, 'home');
      const qwenDir = join(home, '.qwen');
      const canonicalHelp = join(qwenDir, 'skills', 'help');
      const canonicalPlan = join(qwenDir, 'skills', 'plan');
      const legacyHelp = join(home, '.agents', 'skills', 'help');
      await mkdir(canonicalHelp, { recursive: true });
      await mkdir(canonicalPlan, { recursive: true });
      await mkdir(legacyHelp, { recursive: true });
      await writeFile(join(canonicalHelp, 'SKILL.md'), '# canonical help\n');
      await writeFile(join(canonicalPlan, 'SKILL.md'), '# canonical plan\n');
      await writeFile(join(legacyHelp, 'SKILL.md'), '# legacy help\n');

      const res = runOmq(wd, ['doctor'], {
        HOME: home,
        QWEN_HOME: qwenDir,
      });
      if (shouldSkipForSpawnPermissions(res.error)) return;
      assert.equal(res.status, 0, res.stderr || res.stdout);
      assert.match(
        res.stdout,
        /Legacy skill roots: 1 overlapping skill names between .*\.qwen\/skills and .*\.agents\/skills; 1 differ in SKILL\.md content; Qwen Code Enable\/Disable Skills may show duplicates until ~\/\.agents\/skills is cleaned up/,
      );
    } finally {
      await rm(wd, { recursive: true, force: true });
    }
  });
});
