import { createLibraryEslintConfig } from '@dsp-toolkit/shared-config/eslint';

export default createLibraryEslintConfig({
  includeTsx: true,
  globals: {
    fetch: 'readonly',
    process: 'readonly',
  },
});