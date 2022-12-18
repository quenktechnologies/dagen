"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = exports.isNamespaced = exports.NAMESPACE_SEPARATOR = void 0;
const record_1 = require("@quenk/noni/lib/data/record");
const path_1 = require("@quenk/noni/lib/data/record/path");
const array_1 = require("@quenk/noni/lib/data/array");
const _1 = require("./");
exports.NAMESPACE_SEPARATOR = ':';
/**
 * isNamespaced indicates whether a string contains the NAMESPACE_SEPARATOR.
 */
const isNamespaced = (p) => (p.indexOf(exports.NAMESPACE_SEPARATOR) > -1);
exports.isNamespaced = isNamespaced;
/**
 * normalize the use of namespaces in candidate schema using a list of
 * approved namespaces.
 */
const normalize = (namespaces) => (o) => {
    let [ns, nns] = divideByNamespaced(o);
    let ret = inflate({})(nns);
    let nsGrouped = erase(groupByNamespace(ns));
    return namespaces.reduce((p, c) => nsGrouped.hasOwnProperty(c) ?
        inflate(p)(nsGrouped[c]) :
        p, ret);
};
exports.normalize = normalize;
const divideByNamespaced = (o) => (0, record_1.partition)((0, path_1.flatten)(o), (_, k) => (0, exports.isNamespaced)(k));
const inflate = (init) => (o) => (0, record_1.rmerge)(init, (0, path_1.unflatten)(o));
const groupByNamespace = (o) => (0, record_1.group)(o, (_, key) => (0, array_1.tail)(key.split(exports.NAMESPACE_SEPARATOR)[0].split(_1.PATH_SEPARATOR)));
const erase = (nsGrouped) => (0, record_1.map)(nsGrouped, (o, group) => (0, record_1.reduce)(o, {}, (p, c, k) => (0, record_1.merge)(p, { [k.replace(`${group}${exports.NAMESPACE_SEPARATOR}`, '')]: c })));
//# sourceMappingURL=namespace.js.map