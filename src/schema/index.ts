/**
 * This module provides Schema types for making working with DDS schema
 * easier.
 *
 * Note that the types represent fully expanded schema and do not take
 * short-hand into account.
 */
import {
    Object as JSONObject,
    Value as JSONValue
} from '@quenk/noni/lib/data/json';

import { merge, map, isRecord } from '@quenk/noni/lib/data/record';
import { isString } from '@quenk/noni/lib/data/type';
import { id } from '@quenk/noni/lib/data/function';
import { match } from '@quenk/noni/lib/control/match';
import { Spec } from './checks/spec';

export const TYPE_OBJECT = 'object';
export const TYPE_ARRAY = 'array';
export const TYPE_SUM = 'sum';
export const TYPE_STRING = 'string';
export const TYPE_NUMBER = 'number';
export const TYPE_BOOLEAN = 'boolean';
export const TYPE_TUPLE = 'tuple';

export const objectShapeWithAllProperties = {
    type: TYPE_OBJECT,

    properties: Object,

    additionalProperties: Object
};

export const objectShapeWithProperties = {
    type: TYPE_OBJECT,

    properties: Object
};

export const objectShapeWithAdditionalProperties = {
    type: TYPE_OBJECT,

    additionalProperties: Object
};

export const arrayShape = {
    type: TYPE_ARRAY,

    items: Object
};

export const tupleShape = {
    type: TYPE_TUPLE,

    items: Array
};

export const sumShape = {
    type: TYPE_SUM,

    variants: Object
};

export const stringShape = {
    type: TYPE_STRING
};

export const numberShape = {
    type: TYPE_NUMBER
};

export const booleanShape = {
    type: TYPE_BOOLEAN
};

export const externalShape = {
    type: String
};

export const refShape = {
    type: 'ref',

    ref: String
};

/**
 * Root is the top level schema that describes an entire data document.
 */
export type Root = ObjectType | SumType;

/**
 * Schema describes the allowed value or shape of a data value
 * for a value somewhere in a JSON document.
 */
export interface Schema extends JSONObject {
    /**
     * type indicates the type the value should be treated as.
     */
    type: string;

    /**
     * definitions if specified, are used by the runtime to register schema
     * that can be referenced later.
     */
    definitions?: Schemas;

    /**
     * $checks specs for the checks extension.
     */
    $checks?: Spec[];
}

/**
 * ObjectType indicates a value is an object type.
 */
export interface ObjectType extends Schema {
    /**
     * properties of the object type indicates the allowed schema
     * for specific properties of an ObjectType.
     */
    properties?: Schemas;

    /**
     * additionalProperties indicates the allowed schema for properties
     * not explicitly described in the properties section.
     */
    additionalProperties?: Schema;
}

/**
 * Schemas is a map of schemas.
 */
export interface Schemas {
    [key: string]: Schema;
}

/**
 * ArrayType indicates a value is an array type.
 */
export interface ArrayType extends Schema {
    /**
     * items describes the schema of the arrays elements.
     */
    items: Schema;
}

/**
 * TupleType indicates a value is a tuple type.
 */
export interface TupleType extends Schema {
    /**
     * items provides a schema for each member of the tuple.
     */
    items: Schema[];
}

/**
 * SumType indicates a value is a sum type.
 */
export interface SumType extends Schema {
    /**
     * variants specifies the schemas that are part of the sum.
     */
    variants: Schemas;

    /**
     * discriminator hints how to discriminate the sum.
     * who the members of the sum should be discriminated
     */
    discriminator: {
        [key: string]: JSONValue;

        type: string;
    };
}

/**
 * isObjectType type guard.
 */
export const isObjectType = (doc: JSONValue): doc is ObjectType =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc)['type'] === TYPE_OBJECT
        ? true
        : false;

/**
 * isArrayType type guard.
 */
export const isArrayType = (doc: JSONValue): doc is ArrayType =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_ARRAY
        ? true
        : false;

export const isTupleType = (doc: JSONValue): doc is TupleType =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_TUPLE;

/**
 * isSumType type guard.
 */
export const isSumType = (doc: JSONValue): doc is SumType =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_SUM
        ? true
        : false;

/**
 * isStringType type guard.
 */
export const isStringType = (doc: JSONValue): doc is Schema =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_STRING;

/**
 * isNumberType type guard.
 */
export const isNumberType = (doc: JSONValue): doc is Schema =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_NUMBER;

/**
 * isBooleanType type guard.
 */
export const isBooleanType = (doc: JSONValue): doc is Schema =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    (<{ type: string }>doc).type === TYPE_BOOLEAN;

/**
 * isExternalType type guard.
 */
export const isExternalType = (doc: JSONValue): doc is Schema =>
    typeof doc === 'object' &&
    !Array.isArray(doc) &&
    [TYPE_OBJECT, TYPE_ARRAY].indexOf(String((<{ type: string }>doc).type)) < 0
        ? true
        : false;

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
export const expand = (o: JSONObject): JSONObject =>
    match(o)
        .caseOf({ type: TYPE_OBJECT }, expandObjectType)
        .caseOf({ type: TYPE_ARRAY }, expandArrayType)
        .caseOf({ type: TYPE_SUM }, expandSumType)
        .orElse(id)
        .end();

const expandObjectType = (o: JSONObject) =>
    merge(
        merge(merge(o, expandProperties(o)), expandAdditonalProperties(o)),
        expandDefinitions(o)
    );

const expandProperties = (o: JSONObject): JSONObject =>
    isRecord(o['properties'])
        ? { properties: map(<JSONObject>o['properties'], expandType) }
        : {};

const expandAdditonalProperties = (o: JSONObject): JSONObject =>
    isString(o['additionalProperties'])
        ? { additionalProperties: { type: o['additionalProperties'] } }
        : {};

const expandDefinitions = (o: JSONObject): JSONObject =>
    isRecord(o['definitions'])
        ? { definitions: map(<JSONObject>o['definitions'], expandType) }
        : {};

const expandArrayType = (o: JSONObject) =>
    merge(o, { items: expandType(o['items']) });

const expandSumType = (o: JSONObject): JSONObject =>
    merge(
        o,
        isRecord(o['variants'])
            ? { variants: map(<JSONObject>o['variants'], expandType) }
            : {}
    );

const expandType = (value: JSONValue) =>
    isString(value) ? { type: value } : isRecord(value) ? expand(value) : value;
