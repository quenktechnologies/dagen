import { set, get } from 'property-seek';
import { merge, reduce } from '@quenk/noni/lib/data/record';
import { Result } from '@quenk/preconditions/lib/result';
import { Schema, } from '../';
import { evalUsages, pull } from './usage';

export { Result }

/**
 * Definition is a schema that can be re-used elsewhere in the document.
 */
export type Definition = Schema;

/**
 * Definitions 
 */
export interface Definitions {

    [key: string]: Definition

}

export const resolve =
    (defs: Definitions) => (schema: Schema): Result<Schema, Schema> =>
        <Result<Schema, Schema>>(evalUsages(defs)(pull({})('')(schema)))
            .map((wanted: Definitions) => reduce(wanted, schema, _resolve));

const _resolve = (p: Schema, c: Schema, k: string): Schema =>
    set(k, merge(<Definition>get(k, p), c), p);
