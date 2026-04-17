import { createLibraryEslintConfig } from '@dsp-toolkit/shared-config/eslint';

export default createLibraryEslintConfig({
  globals: {
    process: 'readonly',
  },
});