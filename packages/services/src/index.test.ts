import * as services from './index';

// Smoke tests: verify the package builds and exports cleanly.
// Todos are stubs to implement after source migration from agrimetrics-services-lib.

describe('@agrimetrics/services', () => {
  it('resolves the package entrypoint', () => {
    expect(services).toBeDefined();
  });

  it.todo('exports BaseService');

  it.todo('exports CatalogService');

  it.todo('exports AzureService');
});
