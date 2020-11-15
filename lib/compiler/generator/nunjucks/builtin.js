"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filters = exports.functions = exports.takeSums = exports.takeObjects = exports.takeArrays = void 0;
const typ = require("@quenk/noni/lib/data/type");
const arrays = require("@quenk/noni/lib/data/array");
const strings = require("@quenk/noni/lib/data/string");
const schema = require("../../../schema");
const property_seek_1 = require("property-seek");
const record_1 = require("@quenk/noni/lib/data/record");
/**
 * takeArrays extracts the columns from a list that are array types.
 */
exports.takeArrays = (doc) => record_1.reduce(doc, {}, (p, c, k) => schema.isArrayType(c) ?
    record_1.rmerge(p, { [k]: c }) : p);
/**
 *  * takeObjects extracts type='object' columns.
 *   */
exports.takeObjects = (doc) => record_1.reduce(doc, {}, (p, c, k) => schema.isObjectType(c) ?
    record_1.rmerge(p, { [k]: c }) : p);
/**
 * takeSums extracts type='sum' columns.
 */
exports.takeSums = (doc) => record_1.reduce(doc, {}, (p, c, k) => schema.isSumType(c) ?
    record_1.rmerge(p, { [k]: c }) : p);
//XXX: this will be removed once we plugins
const pathJoin = (l, r) => [l, r].filter(v => v).join('.');
const mergeVariants = (o) => record_1.reduce(o.variants, (p, c) => record_1.merge(p, c.properties), {});
/**
 * functions made available for templates.
 */
exports.functions = {
    'isArray': typ.isArray,
    'isObject': typ.isObject,
    'isFunction': typ.isFunction,
    'isNumber': typ.isNumber,
    'isString': typ.isString,
    'isBoolean': typ.isBoolean,
    'isPrim': typ.isPrim,
    'isArrayType': schema.isArrayType,
    'isObjectType': schema.isObjectType,
    'isStringType': schema.isStringType,
    'isNumberType': schema.isNumberType,
    'isBooleanType': schema.isBooleanType,
    'isSumType': schema.isSumType,
    'merge': record_1.merge,
    'rmerge': record_1.rmerge,
    'get': property_seek_1.get,
    'set': property_seek_1.set,
    'require': require,
    'takeArrays': exports.takeArrays,
    'takeObjects': exports.takeObjects,
    'takeSums': exports.takeSums,
    'contains': arrays.contains,
    'pathjoin': pathJoin,
    'startsWith': strings.startsWith,
    'endsWith': strings.endsWith,
    'includes': strings.contains,
    'camelCase': strings.camelCase,
    'classCase': strings.classCase,
    'capitalize': strings.capitalize,
    'uncapitalize': strings.uncapitalize,
    'propercase': strings.propercase,
    'alpha': strings.alpha,
    'numeric': strings.numeric,
    'alphanumeric': strings.alphaNumeric
};
/**
 * filters made available for templates.
 */
exports.filters = {
    'throw': (msg) => { throw new Error(msg); },
    'error': console.error,
    'log': console.log,
    'info': console.info,
    'mergevariants': mergeVariants,
    'camelcase': strings.camelCase,
    'classcase': strings.classCase,
    'capitalize': strings.capitalize,
    'uncapitalize': strings.uncapitalize,
    'propercase': strings.propercase,
    'alpha': strings.alpha,
    'numeric': strings.numeric,
    'alphanumeric': strings.alphaNumeric
};
//# sourceMappingURL=builtin.js.map