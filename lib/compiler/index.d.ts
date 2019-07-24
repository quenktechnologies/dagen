import { Value, Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Loader } from '../schema/loader';
import { Check } from '../schema/checks';
import { Schema } from '../schema';
import { Definitions } from '../schema/definitions';
import { Maybe } from '@quenk/noni/lib/data/maybe';
/**
 * Plugin for the compiler.
 */
export interface Plugin {
    /**
     * beforeOutput is applied to the schema before output of te
     * generated code.
     */
    beforeOutput(s: Schema): Future<Schema>;
}
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
    constructor(definitions: Definitions, namespaces: string[], checks: Check<Value>[], loader: Loader);
    plugins: Maybe<Plugin>;
    /**
     * addDefinitions to the Context.
     */
    addDefinitions(defs: Definitions): Context;
    /**
     * setPlugin sets the plugin to be used during compilation.
     */
    setPlugin(plugin: Plugin): Context;
    /**
     * fragmentResolution stage.
     *
     * During this stage, ref properties are recursively resolved and merged into
     * their owners.
     */
    fragmentResolution(o: Object): Future<Object>;
    /**
     * schemaExpansion stage.
     *
     * During this stage, short-hand such as `"type": "string"` are expanded
     * to full JSON objects in supported places.
     */
    schemaExpansion(o: Object): Future<Object>;
    /**
     * definitionRegistration stage.
     *
     * During this stage, the processing program registers each definition
     * under their respective names.
     */
    definitionRegistration(o: Object): Future<Context>;
    /**
     * definitionMerging
     * At this stage all usage of defined types are resolved.
     */
    definitionMerging(o: Object): Future<Object>;
    /**
     * checksStage applies schema and custom checks.
     *
     * This stage determines whether the object is fit for use.
     */
    checkStage(o: Object): Future<Object>;
    /**
     * compile a JSON document into a valid document schema.
     */
    compile(doc: Object): Future<Object>;
}
