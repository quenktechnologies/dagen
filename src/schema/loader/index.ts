import * as Promise from 'bluebird';
import { set } from 'property-seek';
import { Object, Value } from '@quenk/noni/lib/data/json';
import {
    Record,
    flatten,
    partition,
    map,
    reduce,
    merge,
    values,
    rmerge
} from '@quenk/noni/lib/data/record';
import { match } from '@quenk/noni/lib/control/match';
import { PATH_SEPARATOR } from '../path';

export const REF_SYMBOL = '$ref';

/**
 * Loader is the type of function used to load a JSON object fragment
 * into memory.
 */
export interface Loader {

    /**
     * load an object fragment into memory using the specified path.
     */
    load: (path: string) => Promise<Object>

    /**
     * create a new Loader instance that will operate relative to the
     * cwd specified.
     */
    create: (cwd: string) => Loader

}

/**
 * load a schema into memory recursively.
 */
export const load = (f: Loader) => (o: Object)
    : Promise<Object> => {

    let [ref, reg] = divide(o);
    let resolved = eraseRefProperties(map(<Object>ref, fetch(f)));

    return Promise
        .resolve(inflate(reg))
        .then((regs: Object) => constructFragment(resolved)
            .then((refs: Object) => rmerge(regs, refs)));

}

/**
 * divide an object into two flattened maps of ref properties
 * and non-ref properties respectively.
 * @private
 */
const divide = (o: Object): [Object, Object] =>
    <[Object, Object]>(partition(flatten(o))((_, k: string) =>
        k.indexOf(REF_SYMBOL) > -1));

/**
 * fetch a schema using a Loader function and the value
 * of the ref property. 
 *
 * Only accepts strings and arrays, nested objects are unintended side-effect.
 * @private
 */
const fetch = (f: Loader) => (v: Value): Promise<Object> => <Promise<Object>>match(v)
    .caseOf(String, nestedFetch(f))
    .caseOf(Array, mergeRejectedList(f))
    .orElse(rejectFetchPath)
    .end();

const nestedFetch = (f: Loader) => (path: string)
  : Promise<Object> => 
  f
  .load(path)
  .then((val:Value) =><Promise<Object>> match(val)
        .caseOf({}.constructor, load(f))
        .orElse(rejectNonObject)
        .end());

const rejectNonObject = (value: Value) =>
  Promise.reject(new Error(`References must only point to objects! `+
  `Not : '${typeof value}'!`));

const mergeRejectedList = (f: Loader) => (list: Value[]) =>
    Promise
        .all(list.map(fetch(f)))
        .reduce(rmerge, {});

const rejectFetchPath = (value: Value) =>
    Promise.reject(new Error(`Cannot use type '${typeof value}' as a reference!`));

const inflate = (o: Object) =>
    reduce(o, {}, (p: Object, c, k: string) => set(k, c, p));

/**
 * eraseRefProperties from a flat map of fragments (symbol only).
 */
const eraseRefProperties =
    (resolved: Record<Promise<Object>>): Record<Promise<Object>> =>
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
const constructFragment = (o: Record<Promise<Object>>): Promise<Object> =>
    Promise
        .all(tagPromises(o))
        .then(reconcile);

const tagPromises = (o: Record<Promise<Object>>) =>
    values(map(o, (p: Promise<Object>, key) =>
        p.then((value: Object) => ({ key, value }))));

const reconcile = (vals: { key: string, value: Object }[]) =>
    vals.reduce((p, { key, value }) => (key === '') ?
        rmerge(p, value) :
        set(key, value, p), {});
