"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const property_seek_1 = require("property-seek");
const record_1 = require("@quenk/noni/lib/data/record");
const match_1 = require("@quenk/noni/lib/control/match");
const path_1 = require("../path");
exports.REF_SYMBOL = '$ref';
/**
 * load references in a schema recursively.
 */
exports.load = (f) => (o) => {
    let [ref, reg] = divide(o);
    let resolved = eraseRefProperties(record_1.map(ref, fetch(f)));
    return Promise
        .resolve(inflate(reg))
        .then((regs) => constructFragment(resolved)
        .then((refs) => record_1.rmerge(regs, refs)));
};
/**
 * divide an object into two flattened maps of ref properties
 * and non-ref properties respectively.
 * @private
 */
const divide = (o) => (record_1.partition(record_1.flatten(o))((_, k) => k.indexOf(exports.REF_SYMBOL) > -1));
/**
 * fetch a schema using a Loader function and the value
 * of the ref property.
 *
 * Only accepts strings and arrays, nested objects are unintended side-effect.
 * @private
 */
const fetch = (f) => (v) => match_1.match(v)
    .caseOf(String, nestedFetch(f))
    .caseOf(Array, mergeRejectedList(f))
    .orElse(rejectFetchPath)
    .end();
const nestedFetch = (f) => (path) => f
    .load(path)
    .then((val) => match_1.match(val)
    .caseOf({}.constructor, exports.load(f.create(path)))
    .orElse(rejectNonObject)
    .end());
const rejectNonObject = (value) => Promise.reject(new Error(`References must only point to objects! ` +
    `Not : '${typeof value}'!`));
const mergeRejectedList = (f) => (list) => Promise
    .all(list.map(fetch(f)))
    .reduce(record_1.rmerge, {});
const rejectFetchPath = (value) => Promise.reject(new Error(`Cannot use type '${typeof value}' as a reference!`));
const inflate = (o) => record_1.reduce(o, {}, (p, c, k) => property_seek_1.set(k, c, p));
/**
 * eraseRefProperties from a flat map of fragments (symbol only).
 */
const eraseRefProperties = (resolved) => record_1.reduce(resolved, {}, (p, c, k) => record_1.merge(p, { [unref(k)]: c }));
const unref = (k) => k
    .split(`${path_1.PATH_SEPARATOR}${exports.REF_SYMBOL}`)
    .join('')
    .split(exports.REF_SYMBOL)
    .join('');
/**
 * constructFragment constructs a single schema from a flat map of resolved
 * references.
 * @private
 */
const constructFragment = (o) => Promise
    .all(tagPromises(o))
    .then(reconcile);
const tagPromises = (o) => record_1.values(record_1.map(o, (p, key) => p.then((value) => ({ key, value }))));
const reconcile = (vals) => vals.reduce((p, { key, value }) => (key === '') ?
    record_1.rmerge(p, value) :
    property_seek_1.set(key, value, p), {});
//# sourceMappingURL=index.js.map