"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("afpl/lib/util");
const string_1 = require("@quenk/preconditions/lib/string");
const object_1 = require("@quenk/preconditions/lib/object");
const preconditions_1 = require("@quenk/preconditions");
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
 * typeChecks for the Type interface.
 */
exports.typeChecks = {
    type: string_1.isString
};
/**
 * objectTypeChecks for the ObjectType interface.
 */
exports.objectTypeChecks = {
    type: preconditions_1.equals(exports.OBJECT_TYPE),
    get properties() {
        return object_1.map(exports.propertiesCheck);
    }
};
/**
 * arrayTypeChecks for the ArrayType interface.
 */
exports.arrayTypeChecks = {
    type: preconditions_1.equals(exports.ARRAY_TYPE),
    get items() { return exports.propertiesCheck; }
};
/**
 * sumTypeChecks for the SumType interface.
 */
exports.sumTypeChecks = {
    type: preconditions_1.equals(exports.SUM_TYPE),
    variants: object_1.intersect(exports.typeChecks)
};
/**
 * propertiesCheck for the properties property of ObjectTypes.
 */
exports.propertiesCheck = preconditions_1.and(object_1.isObject, preconditions_1.when(exports.isObjectType, object_1.union(exports.objectTypeChecks), preconditions_1.when(exports.isArrayType, object_1.union(exports.arrayTypeChecks), preconditions_1.when(exports.isSumType, object_1.union(exports.sumTypeChecks), object_1.union(exports.typeChecks)))));
/**
 * documentChecks for the Document interface.
 */
exports.documentChecks = util_1.fuse(exports.objectTypeChecks, { title: preconditions_1.optional(string_1.isString) });
//# sourceMappingURL=checks.js.map