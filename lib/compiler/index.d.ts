import { Value, Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Loader } from '../schema/loader';
import { Check } from '../schema/checks';
import { Definitions } from '../schema/definitions';
import { Plugin } from './plugin';
/**
 * Context compilation takes place in.
 *
 * @property namespaces - Used todistinguish which properties are in effect.
 * @property checks     - Checks to be applied to the schema once it is compiled.
 * @property loader     - Loader used to resolve fragment references.
 */
export declare class Context {
    definitions: Definitions;
    namespaces: string[];
    checks: Check<Value>[];
    loader: Loader;
    plugins: Plugin[];
    constructor(definitions: Definitions, namespaces: string[], checks: Check<Value>[], loader: Loader, plugins: Plugin[]);
    /**
     * addDefinitions to the Context.
     */
    addDefinitions(defs: Definitions): Context;
}
/**
 * fragmentResolution stage.
 *
 * During this stage, ref properties are recursively resolved and merged into
 * their owners.
 */
export declare const fragmentResolution: (c: Context) => (o: Object) => Future<Object>;
/**
 * schemaExpansion stage.
 *
 * During this stage, short-hand such as `"type": "string"` are expanded
 * to full JSON objects in supported places.
 */
export declare const schemaExpansion: (o: Object) => Future<Object>;
/**
 * definitionRegistration stage.
 *
 * During this stage, the processing program registers each definition
 * under their respective names.
 */
export declare const definitionRegistration: (c: Context) => (o: Object) => Future<Context>;
/**
 * definitionMerging
 * At this stage all usage of defined types are resolved.
 */
export declare const definitionMerging: (o: Object) => (c: Context) => Future<Object>;
/**
 * checksStage applies schema and custom checks.
 *
 * This stage determines whether the object is fit for use.
 */
export declare const checkStage: (c: Context) => (o: Object) => Future<Object>;
/**
 * compile a JSON document into a valid document schema.
 */
export declare const compile: (c: Context) => (j: Object) => Future<Object>;
