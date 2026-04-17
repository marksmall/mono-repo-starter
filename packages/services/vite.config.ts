import { createSimpleLibraryViteConfig } from '@dsp-toolkit/shared-config/vite';

// TODO: switch back to createServicesViteConfig after source migration from agrimetrics-services-lib.
export default createSimpleLibraryViteConfig(import.meta.url);