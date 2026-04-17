import * as events from './index';

// Smoke tests: verify the package builds and exports cleanly.
// Todos are stubs to implement after source migration from agrimetrics-eventlib.

describe('@agrimetrics/agrieventlib', () => {
  it('resolves the package entrypoint', () => {
    expect(events).toBeDefined();
  });

  it.todo('exports a publisher class or factory');

  it.todo('exports a dispatcher');
});
