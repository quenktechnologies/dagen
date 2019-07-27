import { Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Value } from '@quenk/noni/lib/data/json';
import { Definitions } from '../schema/definitions';
import { Plugin } from '../plugin';
import { Schema } from '../schema';
import { Context } from '../compiler';
export declare const MODULE_SCHEME = "require";
export declare const EVAL_SCHEME = "eval";
/**
 * load reads a module into memory using node's require machinery.
 */
export declare const load: <M>(path: string) => Future<M>;
/**
 * loadN loads one or more modules into memory.
 */
export declare const loadN: <M>(paths: string[]) => Future<M[]>;
/**
 * loadSchema into memory.
 */
export declare const loadSchema: (path: string) => Future<Object>;
/**
 * loadDefinitions from an array of module paths.
 */
export declare const loadDefinitions: (paths: string[]) => Future<Definitions>;
/**
 * loadPlugins from an array of plugin paths.
 */
export declare const loadPlugins: (ctx: Context, paths: string[]) => Future<Plugin[]>;
/**
 * loadChecks from an array of paths.
 */
export declare const loadChecks: (paths: string[], list?: Schema[]) => Future<import("@quenk/preconditions").Precondition<Value, Value>[]>;
/**
 * loadChecks from an array of paths.
 */
export declare const convertCheckSchema: (s?: Schema[]) => Future<import("@quenk/preconditions").Precondition<Value, Value>[]>;
/**
 * setValues applies setValue for each member of the pairs array.
 */
export declare const setValues: <O extends Object>(o: O) => (pairs: string[]) => Future<O>;
/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
export declare const setValue: <O extends Object>(o: O) => (pair: string) => Future<O>;
