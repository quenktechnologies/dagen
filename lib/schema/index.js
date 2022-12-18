"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expand = exports.isExternalType = exports.isBooleanType = exports.isNumberType = exports.isStringType = exports.isSumType = exports.isTupleType = exports.isArrayType = exports.isObjectType = exports.refShape = exports.externalShape = exports.booleanShape = exports.numberShape = exports.stringShape = exports.sumShape = exports.tupleShape = exports.arrayShape = exports.objectShapeWithAdditionalProperties = exports.objectShapeWithProperties = exports.objectShapeWithAllProperties = exports.TYPE_TUPLE = exports.TYPE_BOOLEAN = exports.TYPE_NUMBER = exports.TYPE_STRING = exports.TYPE_SUM = exports.TYPE_ARRAY = exports.TYPE_OBJECT = void 0;
const record_1 = require("@quenk/noni/lib/data/record");
const type_1 = require("@quenk/noni/lib/data/type");
const function_1 = require("@quenk/noni/lib/data/function");
const match_1 = require("@quenk/noni/lib/control/match");
exports.TYPE_OBJECT = 'object';
exports.TYPE_ARRAY = 'array';
exports.TYPE_SUM = 'sum';
exports.TYPE_STRING = 'string';
exports.TYPE_NUMBER = 'number';
exports.TYPE_BOOLEAN = 'boolean';
exports.TYPE_TUPLE = 'tuple';
exports.objectShapeWithAllProperties = {
    type: exports.TYPE_OBJECT,
    properties: Object,
    additionalProperties: Object
};
exports.objectShapeWithProperties = {
    type: exports.TYPE_OBJECT,
    properties: Object
};
exports.objectShapeWithAdditionalProperties = {
    type: exports.TYPE_OBJECT,
    additionalProperties: Object
};
exports.arrayShape = {
    type: exports.TYPE_ARRAY,
    items: Object
};
exports.tupleShape = {
    type: exports.TYPE_TUPLE,
    items: Array
};
exports.sumShape = {
    type: exports.TYPE_SUM,
    variants: Object
};
exports.stringShape = {
    type: exports.TYPE_STRING
};
exports.numberShape = {
    type: exports.TYPE_NUMBER
};
exports.booleanShape = {
    type: exports.TYPE_BOOLEAN
};
exports.externalShape = {
    type: String
};
exports.refShape = {
    type: 'ref',
    ref: String
};
/**
 * isObjectType type guard.
 */
const isObjectType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc['type'] === exports.TYPE_OBJECT)) ? true : false;
exports.isObjectType = isObjectType;
/**
 * isArrayType type guard.
 */
const isArrayType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_ARRAY)) ? true : false;
exports.isArrayType = isArrayType;
const isTupleType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_TUPLE));
exports.isTupleType = isTupleType;
/**
 * isSumType type guard.
 */
const isSumType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_SUM)) ? true : false;
exports.isSumType = isSumType;
/**
 * isStringType type guard.
 */
const isStringType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_STRING));
exports.isStringType = isStringType;
/**
 * isNumberType type guard.
 */
const isNumberType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_NUMBER));
exports.isNumberType = isNumberType;
/**
 * isBooleanType type guard.
 */
const isBooleanType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_BOOLEAN));
exports.isBooleanType = isBooleanType;
/**
 * isExternalType type guard.
 */
const isExternalType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    ([exports.TYPE_OBJECT, exports.TYPE_ARRAY].indexOf(String(doc.type)) < 0)) ? true : false;
exports.isExternalType = isExternalType;
/**
 * expand a JSON object by expanding schema short-hand.
 *
 * Expansion occurs under the following circumstances:
 * 1. When a property of the `properties` section of an object type is a string.
 * 2. When the `additionalProperties` section of an object type is a string.
 * 3. When the `items` property of an array type is a string.
 * 4. When a property of the `variants` section of a sum type is a string.
 * 5. When a property of the `definitions` section of the root schema is a string.
 */
const expand = (o) => (0, match_1.match)(o)
    .caseOf({ type: exports.TYPE_OBJECT }, expandObjectType)
    .caseOf({ type: exports.TYPE_ARRAY }, expandArrayType)
    .caseOf({ type: exports.TYPE_SUM }, expandSumType)
    .orElse(function_1.id)
    .end();
exports.expand = expand;
const expandObjectType = (o) => (0, record_1.merge)((0, record_1.merge)((0, record_1.merge)(o, expandProperties(o)), expandAdditonalProperties(o)), expandDefinitions(o));
const expandProperties = (o) => (0, record_1.isRecord)(o['properties']) ?
    { properties: (0, record_1.map)(o['properties'], expandType) } :
    {};
const expandAdditonalProperties = (o) => (0, type_1.isString)(o['additionalProperties']) ?
    { additionalProperties: { type: o['additionalProperties'] } } :
    {};
const expandDefinitions = (o) => (0, record_1.isRecord)(o['definitions']) ?
    { definitions: (0, record_1.map)(o['definitions'], expandType) } :
    {};
const expandArrayType = (o) => (0, record_1.merge)(o, { items: expandType(o['items']) });
const expandSumType = (o) => (0, record_1.merge)(o, (0, record_1.isRecord)(o['variants']) ?
    { variants: (0, record_1.map)(o['variants'], expandType) } :
    {});
const expandType = (value) => (0, type_1.isString)(value) ?
    { type: value } :
    (0, record_1.isRecord)(value) ? (0, exports.expand)(value) : value;
//# sourceMappingURL=index.js.map