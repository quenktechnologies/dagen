import * as Promise from 'bluebird';
import { Object } from '@quenk/noni/lib/data/json';
import { Value } from '@quenk/noni/lib/data/json';
import { Plugin } from '../compiler/plugin';
import { Definitions } from '../schema/definitions';
export declare const MODULE_SCHEME = "require";
export declare const EVAL_SCHEME = "eval";
/**
 * load reads a module into memory using node's require machinery.
 */
export declare const load: <M>(path: string) => Promise<M>;
/**
 * loadN loads one or more modules into memory.
 */
export declare const loadN: <M>(paths: string[]) => Promise<M[]>;
/**
 * loadSchema into memory.
 */
export declare const loadSchema: (path: string) => Promise<Object>;
/**
 * loadDefinitions from an array of module paths.
 */
export declare const loadDefinitions: (paths: string[]) => Promise<Definitions>;
/**
 * loadPlugins from an array of plugin paths.
 */
export declare const loadPlugins: (paths: string[]) => Promise<Plugin[]>;
/**
 * loadChecks from an array of check paths.
 */
export declare const loadChecks: (paths: string[]) => Promise<import("@quenk/preconditions").Precondition<Value, Value>[]>;
/**
 * setValues applies setValue for each member of the pairs array.
 */
export declare const setValues: <O extends Object>(o: O) => (pairs: string[]) => Promise<O>;
/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
export declare const setValue: <O extends Object>(o: O) => (pair: string) => Promise<O>;
