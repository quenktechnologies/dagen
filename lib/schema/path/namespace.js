"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_seek_1 = require("property-seek");
const record_1 = require("@quenk/noni/lib/data/record");
const path_1 = require("@quenk/noni/lib/data/record/path");
const array_1 = require("@quenk/noni/lib/data/array");
const _1 = require("./");
exports.NAMESPACE_SEPARATOR = ':';
/**
 * isNamespaced indicates whether a string contains the NAMESPACE_SEPARATOR.
 */
exports.isNamespaced = (p) => (p.indexOf(exports.NAMESPACE_SEPARATOR) > -1);
/**
 * normalize the use of namespaces in candidate schema using a list of
 * approved namespaces.
 */
exports.normalize = (namespaces) => (o) => {
    let [ns, nns] = divideByNamespaced(o);
    let ret = inflate({})(nns);
    let nsGrouped = erase(groupByNamespace(ns));
    return namespaces.reduce((p, c) => nsGrouped.hasOwnProperty(c) ?
        inflate(p)(nsGrouped[c]) :
        p, ret);
};
const divideByNamespaced = (o) => (record_1.partition(path_1.flatten(o))((_, k) => exports.isNamespaced(k)));
const inflate = (init) => (o) => record_1.reduce(o, init, (p, c, k) => property_seek_1.set(k, c, p));
const groupByNamespace = (o) => record_1.group(o)((_, key) => array_1.tail(key.split(exports.NAMESPACE_SEPARATOR)[0].split(_1.PATH_SEPARATOR)));
const erase = (nsGrouped) => record_1.map(nsGrouped, (o, group) => record_1.reduce(o, {}, (p, c, k) => record_1.merge(p, { [k.replace(`${group}${exports.NAMESPACE_SEPARATOR}`, '')]: c })));
//# sourceMappingURL=namespace.js.map