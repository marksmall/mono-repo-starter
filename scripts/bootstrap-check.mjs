import { execSync } from 'node:child_process';

const MIN_NODE = '24.12.0';
const MIN_PNPM = '10.0.0';

const parseVersion = (value) =>
  value
    .replace(/^v/, '')
    .split('.')
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0);

const compareVersions = (left, right) => {
  const a = parseVersion(left);
  const b = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if (a[index] > b[index]) {
      return 1;
    }

    if (a[index] < b[index]) {
      return -1;
    }
  }

  return 0;
};

const assertMinVersion = ({ name, current, minimum }) => {
  if (compareVersions(current, minimum) < 0) {
    throw new Error(`${name} ${minimum}+ required, detected ${current}`);
  }
};

const run = (command) => {
  execSync(command, { stdio: 'inherit' });
};

try {
  const nodeVersion = process.version;
  const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();

  assertMinVersion({ name: 'Node.js', current: nodeVersion, minimum: MIN_NODE });
  assertMinVersion({ name: 'pnpm', current: pnpmVersion, minimum: MIN_PNPM });

  console.log(`Environment OK: node ${nodeVersion}, pnpm ${pnpmVersion}`);
  run('pnpm install --frozen-lockfile');
  run('pnpm run quality:ci');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`bootstrap:check failed: ${message}`);
  process.exit(1);
}
