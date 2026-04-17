import * as types from './index';

// Smoke tests: verify the package builds and exports cleanly.
// Todos are stubs to implement after source migration from service-event-types.

describe('@agrimetrics/service-event-types', () => {
  it('resolves the package entrypoint', () => {
    expect(types).toBeDefined();
  });

  it.todo('exports data ingestion event types');

  it.todo('exports a Zod schema');
});
