"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.isObjectType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc['type'] === exports.TYPE_OBJECT)) ? true : false;
/**
 * isArrayType type guard.
 */
exports.isArrayType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_ARRAY)) ? true : false;
/**
 * isSumType type guard.
 */
exports.isSumType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_SUM)) ? true : false;
/**
 * isStringType type guard.
 */
exports.isStringType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_STRING));
/**
 * isNumberType type guard.
 */
exports.isNumberType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_NUMBER));
/**
 * isBooleanType type guard.
 */
exports.isBooleanType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    (doc.type === exports.TYPE_BOOLEAN));
/**
 * isExternalType type guard.
 */
exports.isExternalType = (doc) => ((typeof doc === 'object') &&
    (!Array.isArray(doc)) &&
    ([exports.TYPE_OBJECT, exports.TYPE_ARRAY].indexOf(String(doc.type)) < 0)) ? true : false;
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
exports.expand = (o) => match_1.match(o)
    .caseOf({ type: exports.TYPE_OBJECT }, expandObjectType)
    .caseOf({ type: exports.TYPE_ARRAY }, expandArrayType)
    .caseOf({ type: exports.TYPE_SUM }, expandSumType)
    .orElse(function_1.id)
    .end();
const expandObjectType = (o) => record_1.merge(record_1.merge(record_1.merge(o, expandProperties(o)), expandAdditonalProperties(o)), expandDefinitions(o));
const expandProperties = (o) => record_1.isRecord(o['properties']) ?
    { properties: record_1.map(o['properties'], expandType) } :
    {};
const expandAdditonalProperties = (o) => type_1.isString(o['additionalProperties']) ?
    { additionalProperties: { type: o['additionalProperties'] } } :
    {};
const expandDefinitions = (o) => record_1.isRecord(o['definitions']) ?
    { definitions: record_1.map(o['definitions'], expandType) } :
    {};
const expandArrayType = (o) => record_1.merge(o, { items: expandType(o['items']) });
const expandSumType = (o) => record_1.merge(o, record_1.isRecord(o['variants']) ?
    { variants: record_1.map(o['variants'], expandType) } :
    {});
const expandType = (value) => type_1.isString(value) ?
    { type: value } :
    record_1.isRecord(value) ? exports.expand(value) : value;
//# sourceMappingURL=index.js.map