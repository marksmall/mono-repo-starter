import { cpSync, existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

import { createNodeLibraryTestConfig } from './vitest.config.ts';

const resolveRootDir = (moduleUrl) => fileURLToPath(new URL('.', moduleUrl));

const createCopyRootFilesPlugin = (rootDir) => ({
  name: 'copy-root-files',
  closeBundle: () => {
    const readmePath = resolve(rootDir, 'README.md');
    const packageJsonPath = resolve(rootDir, 'package.json');

    if (existsSync(readmePath)) {
      cpSync(readmePath, resolve(rootDir, 'dist/README.md'));
    }

    if (existsSync(packageJsonPath)) {
      cpSync(packageJsonPath, resolve(rootDir, 'dist/package.json'));
    }
  },
});

const createDtsPlugin = ({ rootDir, exclude = [], remapDistSrc = false }) =>
  dts({
    insertTypesEntry: true,
    exclude,
    beforeWriteFile: remapDistSrc
      ? (filePath, content) => {
          const normalisedPath = filePath.replaceAll('\\', '/');
          const isInDistSrc = normalisedPath.includes('/dist/src/');

          const remappedFilePath = isInDistSrc
            ? filePath.replace(resolve(rootDir, 'dist/src'), resolve(rootDir, 'dist'))
            : filePath;

          return !isInDistSrc && basename(normalisedPath).endsWith('.d.ts')
            ? false
            : { filePath: remappedFilePath, content };
        }
      : undefined,
  });

export const createServicesViteConfig = (moduleUrl) => {
  const rootDir = resolveRootDir(moduleUrl);

  return defineConfig({
    plugins: [
      createDtsPlugin({
        rootDir,
        exclude: ['**/*.test.ts', '**/__tests__/**', 'src/mocks/**', 'vite.config.ts', 'types/**'],
        remapDistSrc: true,
      }),
      createCopyRootFilesPlugin(rootDir),
    ],
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
    build: {
      lib: {
        entry: {
          index: resolve(rootDir, 'src/index.ts'),
          AzureService: resolve(rootDir, 'src/AzureService/index.ts'),
          BaseService: resolve(rootDir, 'src/BaseService/index.ts'),
          CatalogService: resolve(rootDir, 'src/CatalogService/index.ts'),
          ControlledListService: resolve(rootDir, 'src/ControlledListService/index.ts'),
          DataIngestionService: resolve(rootDir, 'src/DataIngestionService/index.ts'),
          DataProtectionService: resolve(rootDir, 'src/DataProtectionService/index.ts'),
          FileManagementService: resolve(rootDir, 'src/FileManagementService/index.ts'),
          GeoService: resolve(rootDir, 'src/GeoService/index.ts'),
          GlobalSearchService: resolve(rootDir, 'src/GlobalSearchService/index.ts'),
          IdentitiesService: resolve(rootDir, 'src/IdentitiesService/index.ts'),
          NotificationService: resolve(rootDir, 'src/NotificationService/index.ts'),
          OntologyService: resolve(rootDir, 'src/OntologyService/index.ts'),
          TilesService: resolve(rootDir, 'src/TilesService/index.ts'),
          VocabService: resolve(rootDir, 'src/VocabService/index.ts'),
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: ['fast-xml-parser', 'geojson', 'notifications-node-client'],
        output: {
          entryFileNames: (chunkInfo) =>
            chunkInfo.name === 'index' ? 'index.js' : `${chunkInfo.name}/index.js`,
          chunkFileNames: 'chunks/[name]-[hash].js',
        },
      },
    },
    test: createNodeLibraryTestConfig({
      rootDir,
      setupFiles: ['vitest.setup.ts'],
      coverage: {
        exclude: ['**/config/*.ts'],
      },
    }),
  });
};

export const createSimpleLibraryViteConfig = (moduleUrl, { dtsExclude = [] } = {}) => {
  const rootDir = resolveRootDir(moduleUrl);

  return defineConfig({
    plugins: [
      createDtsPlugin({
        rootDir,
        exclude: ['**/*.test.ts', '**/__tests__/**', 'vite.config.ts', ...dtsExclude],
      }),
      createCopyRootFilesPlugin(rootDir),
    ],
    build: {
      lib: {
        entry: resolve(rootDir, 'src/index.ts'),
        formats: ['es'],
        fileName: 'index',
      },
      rollupOptions: {
        external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      },
    },
    test: createNodeLibraryTestConfig({ rootDir }),
  });
};