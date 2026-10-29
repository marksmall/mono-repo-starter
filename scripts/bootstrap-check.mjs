import { execSync } from 'node:child_process';

const run = (command) => {
  execSync(command, { stdio: 'inherit' });
};

try {
  // check:versions compares the running Node and pnpm with .tool-versions, the single source
  run('pnpm run check:versions');
  run('pnpm install --frozen-lockfile');
  run('pnpm run quality:ci');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`bootstrap:check failed: ${message}`);
  process.exit(1);
}
