import { isAbsolute, join } from 'path';
import { set } from 'property-seek';

import { Object } from '@quenk/noni/lib/data/json';
import {
    Future,
    attempt,
    parallel,
    raise,
    pure,
    doFuture
} from '@quenk/noni/lib/control/monad/future';
import { Value } from '@quenk/noni/lib/data/json';
import { startsWith } from '@quenk/noni/lib/data/string';
import { merge } from '@quenk/noni/lib/data/record';

import { Check, Context as CheckContext, fromSchema } from '../schema/checks';
import { Definitions } from '../schema/definitions';
import { Plugin, PluginProvider } from '../plugin';
import { Schema } from '../schema';
import { Context } from '../compiler';

export const MODULE_SCHEME = 'require';
export const EVAL_SCHEME = 'eval';

/**
 * load reads a module into memory using node's require machinery.
 */
export const load = <M>(path: string): Future<M> => attempt(() => {

    let p = isAbsolute(path) ? path :
        require.resolve(join(process.cwd(), path));

    let m = require.main.require(p);
    return m.default ? m.default : m;

});

/**
 * loadN loads one or more modules into memory.
 */
export const loadN = <M>(paths: string[]): Future<M[]> =>
    <Future<M[]>>parallel(paths.map(load));

/**
 * loadSchema into memory.
 */
export const loadSchema = (path: string): Future<Object> => path ?
    <Future<Object>>load(path)
        .trap(e => raise(new Error(
            `Error loading schema "${path}": "${e.message}"`))) :
    pure({ type: 'object', title: 'Object', additionalProperties: {} })

/**
 * loadDefinitions from an array of module paths.
 */
export const loadDefinitions = (paths: string[]): Future<Definitions> =>
    <Future<Definitions>>loadN(paths)
        .map(defs => defs.reduce(merge, {}))
        .trap(defsErr);

const defsErr = (e: Error) =>
    raise(new Error(`Failed loading one or more definitions: "${e.message}"`));

/**
 * loadPlugins from an array of plugin paths.
 */
export const loadPlugins = (ctx: Context, paths: string[]): Future<Plugin[]> =>
    doFuture<Plugin[]>(function*() {

        let mods = yield loadN(paths);

        return parallel(mods.map((m: { create: PluginProvider }) =>
            attempt(() => {

                if (typeof m.create !== 'function')
                    throw new Error(`Plugins must export a create function!`);

                return m.create(ctx);

            })))
            .trap((e: Error) =>
                raise(new Error(`Failed loading one or more plugins: ` +
                    `"${e.message}"`)))
    });

/**
 * loadChecks from an array of paths.
 */
export const loadChecks =
    (paths: string[], list: Schema[] = []): Future<Check<Value>[]> =>
        <Future<Check<Value>[]>>loadN(paths)
            .chain((s: Schema[]) =>
                pure(s.concat(list).map(fromSchema(new CheckContext()))))
            .trap(checkErr);

const checkErr = <A>(e: Error): Future<A> =>
    raise(new Error(`Failed loading one or more checks: "${e.message}"`));

/**
 * loadChecks from an array of paths.
 */
export const convertCheckSchema =
    (s: Schema[] = []): Future<Check<Value>[]> =>
        pure(s.map(fromSchema(new CheckContext())))

/**
 * setValues applies setValue for each member of the pairs array.
 */
export const setValues =
    <O extends Object>(o: O) => (pairs: string[]): Future<O> =>
        pairs.reduce((p, c) => p.chain(o => setValue(o)(c)), pure(o));

/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
export const setValue =
    <O extends Object>(o: O) => (pair: string): Future<O> => {

        let [path, value] = pair.split('=');

        return startsWith(MODULE_SCHEME, value) ?
            load(value.split(`${MODULE_SCHEME}://`)[1])
                .map(<M>(m: M) => set(path, m, o)) :
            pure(set(path, value, o));

    }
