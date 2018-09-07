/**
 * This module provides Schema types for making working with DDS schema
 * easier.
 *
 * Note that the types represent fully expanded schema and do not take
 *  short-hand into account.
 */
import { Object, Value } from '@quenk/noni/lib/data/json';
import { merge, map, isRecord } from '@quenk/noni/lib/data/record';
import { isString } from '@quenk/noni/lib/data/type';
import { match } from '@quenk/noni/lib/control/match';

export const TYPE_OBJECT = 'object';
export const TYPE_ARRAY = 'array';
export const TYPE_SUM = 'sum';
export const TYPE_STRING = 'string';
export const TYPE_NUMBER = 'number';
export const TYPE_BOOLEAN = 'boolean';

/**
 * Schema describes the allowed value or shape of a data value
 * for a value somewhere in a JSON document.
 */
export interface Schema extends Object {

    /**
     * type indicates the type the value should be treated as.
     */
    type: string

}

/**
 * ObjectType indicates a value is an object type.
 */
export interface ObjectType extends Schema {

    /**
     * properties of the object type indicates the allowed schema
     * for specific properties of an ObjectType.
     */
    properties?: Schemas

    /**
     * additionalProperties indicates the allowed schema for properties
     * not explicitly described in the properties section.
     */
    additionalProperties?: Schema

}

/**
 * Schemas is a map of schemas.
 */
export interface Schemas {

    [key: string]: Schema

}

/**
 * ArrayType indicates a value is an array type.
 */
export interface ArrayType extends Schema {

    /**
     * items describes the schema of the arrays elements.
     */
    items: Schema

}

/**
 * SumType indicates a value is a sum type.
 */
export interface SumType extends Schema {

    /**
     * variants specifies the schemas that are part of the sum.
     */
    variants: Schemas

    /**
     * discriminator hints how to discriminate the sum.
     * who the members of the sum should be discriminated
     */
    discriminator: {

        [key: string]: Value

        type: string

    }

}

/**
 * Root is the top level schema that describes an entire data document. 
 */
export interface Root extends ObjectType {

    /**
     * definitions if specified, are used by the runtime to register schema
     * that can be referenced later.
     */
    definitions?: Schemas

}

/**
 * normalize a JSON object by expanding schema short-hand.
 *
 * Expansion occurs under the following circumstances:
 * 1. When a property of the `properties` section of an object type is a string.
 * 2. When the `additionalProperties` section of an object type is a string.
 * 3. When the `items` property of an array type is a string.
 * 4. When a property of the `variants` section of a sum type is a string.
 * 5. When a property of the `definitions` section of the root schema is a string.
 */
export const normalize = (o: Object): Object => match(o)
    .caseOf({ type: TYPE_OBJECT }, normalizeObjectType)
    .caseOf({ type: TYPE_ARRAY }, normalizeArrayType)
    .caseOf({ type: TYPE_SUM }, normalizeSumType)
    .end();

const normalizeObjectType = (o: Object) =>
    merge(merge(merge(o, normalizeProperties(o)),
        normalizeAdditonalProperties(o)),
        normalizeDefinitions(o));

const normalizeProperties = (o: Object): Object =>
    isRecord(o['properties']) ?
        { properties: map(<Object>o['properties'], expandType) } :
        {};

const normalizeAdditonalProperties = (o: Object): Object =>
    isString(o['additionalProperties']) ?
        { additionalProperties: { type: o['additionalProperties'] } } :
        {};

const normalizeDefinitions = (o: Object): Object =>
    isRecord(o['definitions']) ?
        { definitions: map(<Object>o['definitions'], expandType) } :
        {};

const normalizeArrayType = (o: Object) =>
    merge(o, { items: expandType(o['items']) });

const normalizeSumType = (o: Object): Object =>
    merge(o, isRecord(o['variants']) ?
        { variants: map(<Object>o['variants'], expandType) } :
        {});

const expandType = (value: Value) => isString(value) ?
    { type: value } :
    isRecord(value) ? normalize(value) : value;
