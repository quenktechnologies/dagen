import * as Promise from 'bluebird';
import { Object } from '@quenk/noni/lib/data/json';
import { set } from 'property-seek';
import { isAbsolute, join } from 'path';
import { Value } from '@quenk/noni/lib/data/json';
import { startsWith } from '@quenk/noni/lib/data/string';
import { merge } from '@quenk/noni/lib/data/record';
import { Plugin } from '../compiler/plugin';
import { Check } from '../schema/checks';
import { Definitions } from '../schema/definitions';


export const MODULE_SCHEME = 'require';
export const EVAL_SCHEME = 'eval';

/**
 * load reads a module into memory using node's require machinery.
 */
export const load = <M>(path: string): Promise<M> => Promise.try(() => {

    let p = isAbsolute(path) ? path :
            require.resolve(join(process.cwd(), path));

    let m = require.main.require(p);
    return m.default ? m.default : m;

});

/**
 * loadN loads one or more modules into memory.
 */
export const loadN = <M>(paths: string[]): Promise<M[]> =>
    <Promise<M[]>>Promise.all(paths.map(load));

/**
 * loadSchema into memory.
 */
export const loadSchema = (path: string): Promise<Object> =>
    <Promise<Object>>load(path)
        .catch(e => Promise.reject(`Error loading schema "${path}": "${e.message}"`));

/**
 * loadDefinitions from an array of module paths.
 */
export const loadDefinitions = (paths: string[]): Promise<Definitions> =>
    <Promise<Definitions>>loadN(paths)
        .then(defs => defs.reduce(merge, {}))
        .catch(defsErr);

const defsErr = (e: Error) =>
    Promise.reject(new Error(`Failed loading one or more definitions: "${e.message}"`));

/**
 * loadPlugins from an array of plugin paths.
 */
export const loadPlugins = (paths: string[]): Promise<Plugin[]> =>
    loadN(paths).catch(pluginErr);

const pluginErr = (e: Error) =>
    Promise.reject(new Error(`Failed loading one or more plugins: "${e.message}"`));

/**
 * loadChecks from an array of check paths.
 */
export const loadChecks = (paths: string[]): Promise<Check<Value>[]> =>
    <Promise<Check<Value>[]>>loadN(paths).catch(checkErr);

const checkErr = (e: Error) =>
    Promise.reject(new Error(`Failed loading one or more checks: "${e.message}"`));

/**
 * setValues applies setValue for each member of the pairs array.
 */
export const setValues =
    <O extends Object>(o: O) => (pairs: string[]): Promise<O> =>
        pairs.reduce((p, c) => p.then(o => setValue(o)(c)), Promise.resolve(o));

/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
export const setValue =
    <O extends Object>(o: O) => (pair: string): Promise<O> => {

        let [path, value] = pair.split('=');

        return startsWith(MODULE_SCHEME, value) ?
            load(value.split(`${MODULE_SCHEME}://`)[1])
                .then(<M>(m: M) => set(path, m, o)) :
            Promise.resolve(set(path, value, o));

    }
