"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_seek_1 = require("property-seek");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const path_1 = require("@quenk/noni/lib/data/record/path");
const match_1 = require("@quenk/noni/lib/control/match");
const namespace_1 = require("../path/namespace");
const path_2 = require("../path");
exports.REF_SYMBOL = '$ref';
/**
 * resolve references in a schema recursively.
 *
 * This function does the job of the following compilation stages recursively:
 * 1. Path expansion.
 * 2. Namespace resolution.
 * 3. Fragment resolution.
 */
exports.resolve = (f, nss) => (o) => {
    let [ref, reg] = divide((namespace_1.normalize(nss)(path_2.expandObject(o))));
    let resolved = eraseRefProperties(record_1.map(ref, fetch(f, nss)));
    return future_1.pure(inflate(reg))
        .chain((regs) => constructFragment(resolved)
        .map((refs) => record_1.rmerge(regs, refs)));
};
/**
 * divide an object into two flattened maps of ref properties
 * and non-ref properties respectively.
 * @private
 */
const divide = (o) => (record_1.partition(path_1.flatten(o))((_, k) => k.indexOf(exports.REF_SYMBOL) > -1));
/**
 * fetch a schema using a Loader function and the value
 * of the ref property.
 *
 * Only accepts strings and arrays, anything else is an unwanted error.
 * @private
 */
const fetch = (f, nss) => (v) => match_1.match(v)
    .caseOf(String, fetchObject(f, nss))
    .caseOf(Array, fetchObjects(f, nss))
    .orElse(fetchWrongReferenceType)
    .end();
const fetchObject = (f, nss) => (path) => f
    .load(path)
    .chain((val) => match_1.match(val)
    .caseOf({}.constructor, exports.resolve(f.create(path), nss))
    .orElse(rejectNonObject)
    .end());
const rejectNonObject = (value) => future_1.raise(new Error(`References must only point to objects! ` +
    `Not : '${typeof value}'!`));
const fetchObjects = (f, nss) => (list) => future_1.parallel(list.map(fetch(f, nss)))
    .map(l => l.reduce(record_1.rmerge, {}));
const fetchWrongReferenceType = (value) => future_1.raise(new Error(`Cannot use type '${typeof value}' as a reference!`));
const inflate = (o) => record_1.reduce(o, {}, (p, c, k) => property_seek_1.set(k, c, p));
/**
 * eraseRefProperties from a flat map of fragments (symbol only).
 */
const eraseRefProperties = (resolved) => record_1.reduce(resolved, {}, (p, c, k) => record_1.merge(p, { [unref(k)]: c }));
const unref = (k) => k
    .split(`${path_2.PATH_SEPARATOR}${exports.REF_SYMBOL}`)
    .join('')
    .split(exports.REF_SYMBOL)
    .join('');
/**
 * constructFragment constructs a single schema from a flat map of resolved
 * references.
 * @private
 */
const constructFragment = (o) => future_1.parallel(tagFutures(o))
    .map(reconcile);
const tagFutures = (o) => record_1.values(record_1.map(o, (p, key) => p.map((value) => ({ key, value }))));
const reconcile = (vals) => vals.reduce((p, { key, value }) => (key === '') ?
    record_1.rmerge(p, value) :
    property_seek_1.set(key, value, p), {});
//# sourceMappingURL=index.js.map