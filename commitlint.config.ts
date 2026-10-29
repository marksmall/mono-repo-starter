import { readFileSync } from 'fs';
import type { UserConfig } from '@commitlint/types';

// .gitmessage is the single source of truth for allowed types and scopes:
// its first line is `type1|type2(scope1|scope2): ...`
const gitmessage = readFileSync(new URL('.gitmessage', import.meta.url), 'utf-8');
const headerMatch = gitmessage.match(/^([\w|-]+)\(([\w|-]+)\)/);

if (!headerMatch) {
  throw new Error('commitlint: could not parse types and scopes from the first line of .gitmessage');
}

const types = headerMatch[1].split('|');
const scopes = headerMatch[2].split('|');

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
    'scope-enum': [2, 'always', scopes],
    'body-empty': [2, 'never'],
    'body-min-length': [2, 'always', 20],
    // Breaking changes must be explicit: a `BREAKING CHANGE:` footer, never the
    // easy-to-miss `feat!:` header shorthand.
    'subject-exclamation-mark': [2, 'never'],
  },
};

export default config;
