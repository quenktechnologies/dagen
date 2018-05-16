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
 * STRING_TYPE
 */
exports.STRING_TYPE = 'string';
/**
 * NUMBER_TYPE
 */
exports.NUMBER_TYPE = 'number';
/**
 * BOOLEAN_TYPE
 */
exports.BOOLEAN_TYPE = 'boolean';
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
 * isStringType type guard.
 */
exports.isStringType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.STRING_TYPE));
/**
 * isNumberType type guard.
 */
exports.isNumberType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.NUMBER_TYPE));
/**
 * isBooleanType type guard.
 */
exports.isBooleanType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.BOOLEAN_TYPE));
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
 * discriminatorChecks for the discriminator field of sum types.
 */
exports.discriminatorChecks = {
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
    variants: preconditions_2.and(object_1.isObject, object_1.intersect(exports.typeChecks)),
    discriminator: preconditions_2.and(object_1.isObject, object_1.intersect(exports.discriminatorChecks))
};
exports.documentSumTypeChecks = {
    type: preconditions_2.equals(exports.SUM_TYPE),
    get variants() {
        return preconditions_2.and(object_1.isObject, object_1.map(object_1.union(exports.objectTypeChecks)));
    }
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
exports.documentCheck = preconditions_1.match(preconditions_1.caseOf({ type: exports.SUM_TYPE }, object_1.union(exports.documentSumTypeChecks)), preconditions_1.caseOf({ type: exports.OBJECT_TYPE }, preconditions_2.and(object_1.union({
    title: preconditions_2.optional(string_1.isString)
}), object_1.union(exports.objectTypeChecks))));
//# sourceMappingURL=checks.js.map