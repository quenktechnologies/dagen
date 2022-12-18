/**
 * The checks module provides functions for validating a JSON document
 * against a Data Document Schema using the Checks Extension features.
 */
import * as json from '@quenk/noni/lib/data/json';
import { Precondition, Preconditions } from '@quenk/preconditions';
import { Schema, Schemas } from '../';
import { Providers } from './provider';
export declare const TYPE_REF = "ref";
/**
 * Check is a Precondition that accepts some JSON value as input.
 */
export type Check<T> = Precondition<json.Value, T>;
/**
 * Checks map.
 */
export type Checks<B extends json.Object> = Preconditions<json.Value, B>;
/**
 * RefType schema.
 */
export interface RefType extends Schema {
    ref: string;
}
/**
 * Context Checks are applied in.
 *
 * Holds useful data used during the transformation process.
 */
export declare class Context<B extends json.Object> {
    checks: Checks<B>;
    providers: Providers<json.Value>;
    constructor(checks?: Checks<B>, providers?: Providers<json.Value>);
    /**
     * addChecks to the Context from a Schemas map.
     *
     * Note: This mutates this context.
     */
    addChecks(s: Schemas): Context<B>;
}
/**
 * fromSchema rewrites a Schema to a chain of Checks.
 *
 * The first argument is a Checks map that will be used
 * for resolving ref types. If a ref type uses a path
 * that can't be resolved the precondition will always fail.
 *
 * XXX: checks on prims/externals
 */
export declare const fromSchema: <B extends json.Object>(c: Context<B>) => (s: Schema) => Check<B>;
