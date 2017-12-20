"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("@quenk/preconditions/lib/string");
const function_1 = require("@quenk/preconditions/lib/function");
const preconditions_1 = require("@quenk/preconditions");
const object_1 = require("@quenk/preconditions/lib/object");
const preconditions_2 = require("@quenk/preconditions");
/**
 * OBJECT_TYPE
 */
exports.OBJECT_TYPE = 'object';
/**
 * ARRAY_TYPE
 */
exports.ARRAY_TYPE = 'array';
/**
 * SUM_TYPE
 */
exports.SUM_TYPE = 'sum';
/**
 * isObjectType type guard.
 */
exports.isObjectType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc['type'] === exports.OBJECT_TYPE)) ? true : false;
/**
 * isArrayType type guard.
 */
exports.isArrayType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.ARRAY_TYPE)) ? true : false;
/**
 * isSumType type guard.
 */
exports.isSumType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.SUM_TYPE)) ? true : false;
/**
 * isUserType type guard.
 */
exports.isUserType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    ([exports.OBJECT_TYPE, exports.ARRAY_TYPE].indexOf(String(doc.type)) < 0)) ? true : false;
/**
 * pluginModuleChecks for loaded plugin modules.
 */
exports.pluginModuleChecks = {
    name: string_1.isString,
    docopt: string_1.isString,
    init: function_1.isFunction
};
/**
 * typeChecks for the Type interface.
 */
exports.typeChecks = {
    type: string_1.isString
};
/**
 * objectTypeChecks for the ObjectType interface.
 */
exports.objectTypeChecks = {
    type: preconditions_2.equals(exports.OBJECT_TYPE),
    get properties() {
        return object_1.map(exports.propertyCheck);
    }
};
/**
 * arrayTypeChecks for the ArrayType interface.
 */
exports.arrayTypeChecks = {
    type: preconditions_2.equals(exports.ARRAY_TYPE),
    get items() { return exports.propertyCheck; }
};
/**
 * sumTypeChecks for the SumType interface.
 */
exports.sumTypeChecks = {
    type: preconditions_2.equals(exports.SUM_TYPE),
    variants: object_1.intersect(exports.typeChecks)
};
/**
 * pluginModuleCheck
 */
exports.pluginModuleCheck = object_1.restrict(exports.pluginModuleChecks);
/**
 * propertyCheck for the properties property of ObjectTypes.
 */
exports.propertyCheck = preconditions_2.and(object_1.isObject, preconditions_1.match(preconditions_1.caseOf({ type: exports.OBJECT_TYPE }, object_1.union(exports.objectTypeChecks)), preconditions_1.caseOf({ type: exports.ARRAY_TYPE }, object_1.union(exports.arrayTypeChecks)), preconditions_1.caseOf({ type: exports.SUM_TYPE }, object_1.union(exports.sumTypeChecks)), object_1.union(exports.typeChecks)));
/**
 * documentCheck for the Document interface.
 */
exports.documentCheck = preconditions_2.and(exports.propertyCheck, object_1.union({ title: preconditions_2.optional(string_1.isString) }));
//# sourceMappingURL=checks.js.map