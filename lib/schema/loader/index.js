"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.REF_SYMBOL = void 0;
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
const resolve = (f, nss) => (o) => {
    let [ref, reg] = divide(((0, namespace_1.normalize)(nss)((0, path_2.expandObject)(o))));
    let resolved = eraseRefProperties((0, record_1.map)(ref, fetch(f, nss)));
    return (0, future_1.pure)((0, path_1.unflatten)(reg))
        .chain((regs) => constructFragment(resolved)
        .map((refs) => (0, record_1.rmerge)(regs, refs)));
};
exports.resolve = resolve;
/**
 * divide an object into two flattened maps of ref properties
 * and non-ref properties respectively.
 * @private
 */
const divide = (o) => (0, record_1.partition)((0, path_1.flatten)(o), (_, k) => k.indexOf(exports.REF_SYMBOL) > -1);
/**
 * fetch a schema using a Loader function and the value
 * of the ref property.
 *
 * Only accepts strings and arrays, anything else is an unwanted error.
 * @private
 */
const fetch = (f, nss) => (v) => (0, match_1.match)(v)
    .caseOf(String, fetchObject(f, nss))
    .caseOf(Array, fetchObjects(f, nss))
    .orElse(fetchWrongReferenceType)
    .end();
const fetchObject = (f, nss) => (path) => f
    .load(path)
    .chain((val) => (0, match_1.match)(val)
    .caseOf({}.constructor, (0, exports.resolve)(f.create(path), nss))
    .orElse(rejectNonObject)
    .end());
const rejectNonObject = (value) => (0, future_1.raise)(new Error(`References must only point to objects! ` +
    `Not : '${typeof value}'!`));
const fetchObjects = (f, nss) => (list) => (0, future_1.parallel)(list.map(fetch(f, nss)))
    .map(l => l.reduce(record_1.rmerge, {}));
const fetchWrongReferenceType = (value) => (0, future_1.raise)(new Error(`Cannot use type '${typeof value}' as a reference!`));
/**
 * eraseRefProperties from a flat map of fragments (symbol only).
 */
const eraseRefProperties = (resolved) => (0, record_1.reduce)(resolved, {}, (p, c, k) => (0, record_1.merge)(p, { [unref(k)]: c }));
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
const constructFragment = (o) => (0, future_1.parallel)(tagFutures(o))
    .map(reconcile);
const tagFutures = (o) => (0, record_1.values)((0, record_1.map)(o, (p, key) => p.map((value) => ({ key, value }))));
const reconcile = (vals) => vals.reduce((p, { key, value }) => (key === '') ?
    (0, record_1.rmerge)(p, value) :
    (0, property_seek_1.set)(key, value, p), {});
//# sourceMappingURL=index.js.map