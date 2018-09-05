/**
 * The checks module provides functions for validating a JSON document
 * against a Data Document Schema using the Checks Extension features.
 */
import * as api from './check';
import { match } from '@quenk/noni/lib/control/match';
import { Schema } from '../';
import { Check } from './check';

/**
 * fromSchema rewrites a schema to a chain of Checks.
 *
 * The result can later be interpreted.
 */
export const fromSchema = (s: Schema): Check => <Check>match(s)
    .caseOf({ type: 'object' }, fromObject)
    .end();

const fromObject = (): Check => api.typeOf('object', '');

