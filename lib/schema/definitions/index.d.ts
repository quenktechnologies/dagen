import { Result } from '@quenk/preconditions/lib/result';
import { Schema } from '../';
export { Result };
/**
 * Definition is a schema that can be re-used elsewhere in the document.
 */
export declare type Definition = Schema;
/**
 * Definitions
 */
export interface Definitions {
    [key: string]: Definition;
}
export declare const resolve: (defs: Definitions) => (schema: Schema) => import("@quenk/noni/lib/data/either").Either<import("@quenk/preconditions/lib/result/failure").Failure<Schema>, Schema>;
