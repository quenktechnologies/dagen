/**
 * This module provides Schema types for making working with DDS schema
 * easier.
 *
 * Note that the types represent fully expanded schema and do not take
 * short-hand into account.
 */
import { Object, Value } from '@quenk/noni/lib/data/json';
import { Spec } from './checks/spec';
export declare const TYPE_OBJECT = "object";
export declare const TYPE_ARRAY = "array";
export declare const TYPE_SUM = "sum";
export declare const TYPE_STRING = "string";
export declare const TYPE_NUMBER = "number";
export declare const TYPE_BOOLEAN = "boolean";
export declare const objectShapeWithAllProperties: {
    type: string;
    properties: ObjectConstructor;
    additionalProperties: ObjectConstructor;
};
export declare const objectShapeWithProperties: {
    type: string;
    properties: ObjectConstructor;
};
export declare const objectShapeWithAdditionalProperties: {
    type: string;
    additionalProperties: ObjectConstructor;
};
export declare const arrayShape: {
    type: string;
    items: ObjectConstructor;
};
export declare const sumShape: {
    type: string;
    variants: ObjectConstructor;
};
export declare const stringShape: {
    type: string;
};
export declare const numberShape: {
    type: string;
};
export declare const booleanShape: {
    type: string;
};
export declare const externalShape: {
    type: StringConstructor;
};
export declare const refShape: {
    type: string;
    ref: StringConstructor;
};
/**
 * Root is the top level schema that describes an entire data document.
 */
export declare type Root = ObjectType | SumType;
/**
 * Schema describes the allowed value or shape of a data value
 * for a value somewhere in a JSON document.
 */
export interface Schema extends Object {
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
        [key: string]: Value;
        type: string;
    };
}
/**
 * isObjectType type guard.
 */
export declare const isObjectType: (doc: Value) => doc is ObjectType;
/**
 * isArrayType type guard.
 */
export declare const isArrayType: (doc: Value) => doc is ArrayType;
/**
 * isSumType type guard.
 */
export declare const isSumType: (doc: Value) => doc is SumType;
/**
 * isStringType type guard.
 */
export declare const isStringType: (doc: Value) => doc is Schema;
/**
 * isNumberType type guard.
 */
export declare const isNumberType: (doc: Value) => doc is Schema;
/**
 * isBooleanType type guard.
 */
export declare const isBooleanType: (doc: Value) => doc is Schema;
/**
 * isExternalType type guard.
 */
export declare const isExternalType: (doc: Value) => doc is Schema;
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
export declare const expand: (o: Object) => Object;
