import releaseConfig from '@dsp-toolkit/shared-config/release';

export default {
	...releaseConfig,
	tagFormat: 'service-event-types-v${version}',
};