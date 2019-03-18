import { set } from 'property-seek';
import { Object, Value } from '@quenk/noni/lib/data/json';
import {
    Future,
    pure,
    raise,
    parallel
} from '@quenk/noni/lib/control/monad/future';
import {
    Record,
    partition,
    map,
    reduce,
    merge,
    values,
    rmerge
} from '@quenk/noni/lib/data/record';
import { flatten, unflatten } from '@quenk/noni/lib/data/record/path';
import { match } from '@quenk/noni/lib/control/match';
import { Namespace, normalize } from '../path/namespace';
import { PATH_SEPARATOR, expandObject } from '../path';

export const REF_SYMBOL = '$ref';

/**
 * Load function.
 */
export type Load = (path: string) => Future<Object>;

/**
 * Create function.
 */
export type Create = (path: string) => Loader;

/**
 * Loader is the type of function used to load a JSON object fragment
 * into memory.
 */
export interface Loader {

    /**
     * load an object fragment into memory using the specified path.
     */
    load: Load;

    /**
     * create a new Loader instance.
     *
     * The path specified will be used to calculate a new effective
     * path for the new Loader to use as its CWD.
     */
    create: Create;

}

/**
 * Loader is the type of function used to load a JSON object fragment
 * into memory.
 */
export interface Loader {

    /**
     * load an object fragment into memory using the specified path.
     */
    load: (path: string) => Future<Object>

    /**
     * create a new Loader instance that will operate relative to the
     * cwd specified.
     */
    create: (cwd: string) => Loader

}

/**
 * resolve references in a schema recursively.
 *
 * This function does the job of the following compilation stages recursively:
 * 1. Path expansion.
 * 2. Namespace resolution.
 * 3. Fragment resolution.
 */
export const resolve = (f: Loader, nss: Namespace[]) => (o: Object)
    : Future<Object> => {

    let [ref, reg] = divide((normalize(nss)(expandObject(o))));
    let resolved = eraseRefProperties(map(<Object>ref, fetch(f, nss)));

    return pure(unflatten(reg))
        .chain((regs: Object) => constructFragment(resolved)
            .map((refs: Object) => rmerge(regs, refs)));

}

/**
 * divide an object into two flattened maps of ref properties
 * and non-ref properties respectively.
 * @private
 */
const divide = (o: Object): [Object, Object] =>
    <[Object, Object]>partition(flatten(o), (_, k: string) =>
        k.indexOf(REF_SYMBOL) > -1);

/**
 * fetch a schema using a Loader function and the value
 * of the ref property. 
 *
 * Only accepts strings and arrays, anything else is an unwanted error.
 * @private
 */
const fetch = (f: Loader, nss: Namespace[]) => (v: Value)
    : Future<Object> => <Future<Object>>match(v)
        .caseOf(String, fetchObject(f, nss))
        .caseOf(Array, fetchObjects(f, nss))
        .orElse(fetchWrongReferenceType)
        .end();

const fetchObject = (f: Loader, nss: Namespace[]) => (path: string)
    : Future<Object> =>
    f
        .load(path)
        .chain((val: Value) => <Future<Object>>match(val)
            .caseOf({}.constructor, resolve(f.create(path), nss))
            .orElse(rejectNonObject)
            .end());

const rejectNonObject = (value: Value) =>
    raise(new Error(`References must only point to objects! ` +
        `Not : '${typeof value}'!`));

const fetchObjects = (f: Loader, nss: Namespace[]) => (list: Value[]) =>
    parallel(list.map(fetch(f, nss)))
        .map(l => l.reduce(rmerge, {}));

const fetchWrongReferenceType = (value: Value) =>
    raise(new Error(`Cannot use type '${typeof value}' as a reference!`));

/**
 * eraseRefProperties from a flat map of fragments (symbol only).
 */
const eraseRefProperties =
    (resolved: Record<Future<Object>>): Record<Future<Object>> =>
        reduce(resolved, {}, (p, c, k) => merge(p, { [unref(k)]: c }));

const unref = (k: string) =>
    k
        .split(`${PATH_SEPARATOR}${REF_SYMBOL}`)
        .join('')
        .split(REF_SYMBOL)
        .join('');

/**
 * constructFragment constructs a single schema from a flat map of resolved
 * references.
 * @private
 */
const constructFragment = (o: Record<Future<Object>>): Future<Object> =>
    parallel(tagFutures(o))
        .map(reconcile);

const tagFutures = (o: Record<Future<Object>>) =>
    values(map(o, (p: Future<Object>, key) =>
        p.map((value: Object) => ({ key, value }))));

const reconcile = (vals: { key: string, value: Object }[]) =>
    vals.reduce((p, { key, value }) => (key === '') ?
        rmerge(p, value) :
        set(key, value, p), {});
