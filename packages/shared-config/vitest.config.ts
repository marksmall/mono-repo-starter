import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { configDefaults } from 'vitest/config';

export const createNodeLibraryTestConfig = ({
  rootDir,
  setupFiles = [],
  include = ['**/*.test.{ts,tsx}'],
  coverage = {},
} = {}) => {
  const resolvedSetupFiles = setupFiles
    .map((filePath) => resolve(rootDir, filePath))
    .filter((filePath) => existsSync(filePath));

  return {
    globals: true,
    environment: 'node',
    allowOnly: true,
    include,
    ...(resolvedSetupFiles.length > 0 ? { setupFiles: resolvedSetupFiles } : {}),
    coverage: {
      provider: 'istanbul',
      skipFull: true,
      exclude: [...(configDefaults.coverage.exclude ?? []), ...(coverage.exclude ?? [])],
      ...coverage,
    },
  };
};