import releaseConfig from '@dsp-toolkit/shared-config/release';

export default {
	...releaseConfig,
	tagFormat: 'services-v${version}',
};