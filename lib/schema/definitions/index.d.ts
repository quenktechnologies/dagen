import { Result } from '@quenk/preconditions/lib/result';
import { Schema } from '../';
export { Result };
/**
 * Definition is a schema that can be re-used elsewhere in the document.
 */
export type Definition = Schema;
/**
 * Definitions
 */
export interface Definitions {
    [key: string]: Definition;
}
export declare const resolve: (defs: Definitions) => (schema: Schema) => Result<Schema, Schema>;
