#!/usr/bin/env node
/* eslint-disable no-undef */
// Keeps .tool-versions the single source of truth for the Node version (and the
// package manager version, if pinned there). Fails if anything disagrees with it:
//   - the pin itself isn't an exact x.y.z version
//   - the running Node (or pnpm) isn't the pinned version
//   - package.json engines / packageManager don't match the pin (apps: exactly;
//     published libraries, i.e. with publishConfig: ">=" the pin)
//   - a Dockerfile hardcodes a Node version instead of taking ARG NODE_VERSION
// Run from the repo root; quality:ci runs it, so CI and the pre-push hook do too.
// Dockerfiles deliberately not converted yet go in package.json under
// "checkVersions": { "ignoredDockerfiles": [...] }, each with a reason in the repo's notes.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const EXACT_VERSION = /^\d+\.\d+\.\d+$/;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', 'coverage']);

const toolVersions = Object.fromEntries(
  readFileSync('.tool-versions', 'utf8')
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/)),
);
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const ignoredDockerfiles = new Set(pkg.checkVersions?.ignoredDockerfiles ?? []);

/** @type {string[]} */
const errors = [];

/** @param {string} message */
const ok = (message) => {
  console.log(`  OK  ${message}`);
};

/**
 * @param {string} label
 * @param {string | undefined} actual
 * @param {string | undefined} expected
 */
const expectEqual = (label, actual, expected) => {
  if (actual === expected) {
    ok(`${label}: ${actual}`);
  } else {
    errors.push(`${label} is "${actual ?? 'missing'}", .tool-versions says "${expected}"`);
  }
};

const node = toolVersions.nodejs;

console.log(`\nChecking versions against .tool-versions (nodejs ${node ?? 'missing'})\n`);

// The pin must be exact, or machines, CI and images drift apart.
if (!node) {
  errors.push('.tool-versions has no nodejs entry');
} else if (EXACT_VERSION.test(node)) {
  ok(`.tool-versions nodejs is exact: ${node}`);
} else {
  errors.push(`.tool-versions nodejs must be an exact x.y.z version, not "${node}"`);
}

// The Node running this script (mise/asdf locally, setup-node in CI).
expectEqual('running Node', process.version.replace(/^v/, ''), node);

const enginesNode = pkg.engines?.node?.trim();

// Apps pin engines.node to the exact version. A published library is checked against the
// consuming app's Node, so it states a minimum instead: exactly ">=" the pinned version, so
// the floor moves with every security bump and nothing older is accepted.
if (pkg.publishConfig) {
  expectEqual('package.json engines.node (library minimum)', enginesNode, `>=${node}`);
} else {
  expectEqual('package.json engines.node', enginesNode, node);
}

// Package managers are only checked when .tool-versions pins them.
for (const manager of ['pnpm', 'yarn']) {
  const pinned = toolVersions[manager];

  if (!pinned) {
    continue;
  }

  // When run via "pnpm run", pnpm reports its own version in the user agent.
  const agent = process.env.npm_config_user_agent?.split(' ')[0] ?? '';
  const running = agent.startsWith(`${manager}/`) ? agent.slice(manager.length + 1) : undefined;

  if (running) {
    expectEqual(`running ${manager}`, running, pinned);
  }

  // Same rule as engines.node: exact for apps, ">=" the pin for published libraries.
  if (pkg.engines?.[manager]) {
    expectEqual(
      `package.json engines.${manager}`,
      pkg.engines[manager].trim(),
      pkg.publishConfig ? `>=${pinned}` : pinned,
    );
  }

  if (pkg.packageManager?.startsWith(`${manager}@`)) {
    const declared = pkg.packageManager.slice(manager.length + 1).split('+')[0];

    expectEqual(`package.json packageManager (${manager})`, declared, pinned);
  }
}

// Every Dockerfile must take Node from the build arg, which CI fills from .tool-versions.
/**
 * @param {string} dir
 * @returns {string[]}
 */
const findDockerfiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return SKIP_DIRS.has(entry.name) ? [] : findDockerfiles(join(dir, entry.name));
    }

    return /^Dockerfile|\.Dockerfile$/.test(entry.name) ? [join(dir, entry.name)] : [];
  });

for (const file of findDockerfiles('.').map((path) => relative('.', path))) {
  if (ignoredDockerfiles.has(file)) {
    console.log(`  --  ${file}: skipped (package.json checkVersions.ignoredDockerfiles)`);
    continue;
  }

  const lines = readFileSync(file, 'utf8').split('\n');

  if (!lines.some((line) => /^\s*FROM\s+node:/i.test(line))) {
    continue;
  }

  const problems = [];

  if (lines.some((line) => /^\s*ARG\s+NODE_VERSION\s*=/.test(line))) {
    problems.push('ARG NODE_VERSION has a default');
  }

  if (!lines.some((line) => /^\s*ARG\s+NODE_VERSION\s*$/.test(line))) {
    problems.push('no ARG NODE_VERSION');
  }

  if (lines.some((line) => /^\s*FROM\s+node:\d/i.test(line))) {
    problems.push('FROM node:<version> is hardcoded');
  }

  if (problems.length > 0) {
    errors.push(`${file}: ${problems.join('; ')}`);
  } else {
    ok(`${file}: Node comes from ARG NODE_VERSION`);
  }
}

console.log('');

if (errors.length > 0) {
  for (const message of errors) {
    console.error(`ERROR: ${message}`);
  }

  console.error('\nFix the above so everything matches .tool-versions.\n');
  process.exit(1);
}

console.log('All versions in sync with .tool-versions.\n');
