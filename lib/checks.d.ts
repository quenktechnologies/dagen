import { Preconditions } from '@quenk/preconditions/lib/object';
import { Precondition } from '@quenk/preconditions';
import { JSONValue, JSONObject, PluginModule } from './';
/**
 * OBJECT_TYPE
 */
export declare const OBJECT_TYPE = "object";
/**
 * ARRAY_TYPE
 */
export declare const ARRAY_TYPE = "array";
/**
 * SUM_TYPE
 */
export declare const SUM_TYPE = "sum";
/**
 * STRING_TYPE
 */
export declare const STRING_TYPE = "string";
/**
 * NUMBER_TYPE
 */
export declare const NUMBER_TYPE = "number";
/**
 * BOOLEAN_TYPE
 */
export declare const BOOLEAN_TYPE = "boolean";
/**
 * Type refers to a property on a Document and describes
 * the fields that may appear.
 */
export interface Type extends JSONObject {
    /**
     * type specifies the type of a property.
     */
    type: string;
}
/**
 * ObjectType describes the properties when type = 'object' is declared.
 */
export interface ObjectType extends Type {
    /**
     * properties of the object type.
     */
    properties?: {
        [key: string]: Type;
    };
}
/**
 *
 * ArrayType describes the properties expected when type = 'array' is declared.
 */
export interface ArrayType extends Type {
    /**
     * items describes the what Types can be members of the array.
     */
    item: Type;
}
/**
 * SumType describes the properties expected when the type = 'sum' is declared.
 */
export interface SumType extends Type {
    /**
     * variants of the sum type.
     */
    variants: {
        [key: string]: Type;
    };
    /**
     * discriminator indicates who the members of the sum should be discriminated
     */
    discriminator: {
        [key: string]: JSONValue;
        type: string;
    };
}
/**
 * StringType describes the properties expected when the type = 'string' is declared.
 */
export interface StringType extends Type {
}
export interface NumberType extends Type {
}
export interface BooleanType extends Type {
}
/**
 * SumType describes the properties expected when the type = 'sum' is declared.
 */
export interface SumType extends Type {
    /**
     * variants of the sum type.
     */
    variants: {
        [key: string]: Type;
    };
}
/**
 *
 * SumType describes the properties expected when the type = 'sum' is declared.
 */
export interface SumType extends Type {
    /**
     * variants of the sum type.
     */
    variants: {
        [key: string]: Type;
    };
}
/**
 * UserType are user specified and have no constraints beyond the type field.
 */
export interface UserType extends Type {
}
/**
 * isObjectType type guard.
 */
export declare const isObjectType: (doc: JSONValue) => doc is ObjectType;
/**
 * isArrayType type guard.
 */
export declare const isArrayType: (doc: JSONValue) => doc is ArrayType;
/**
 * isSumType type guard.
 */
export declare const isSumType: (doc: JSONValue) => doc is SumType;
/**
 * isStringType type guard.
 */
export declare const isStringType: (doc: JSONValue) => doc is StringType;
/**
 * isNumberType type guard.
 */
export declare const isNumberType: (doc: JSONValue) => doc is NumberType;
/**
 * isBooleanType type guard.
 */
export declare const isBooleanType: (doc: JSONValue) => doc is BooleanType;
/**
 * isUserType type guard.
 */
export declare const isUserType: (doc: JSONValue) => doc is UserType;
/**
 * pluginModuleChecks for loaded plugin modules.
 */
export declare const pluginModuleChecks: Preconditions<any, string | Function>;
/**
 * typeChecks for the Type interface.
 */
export declare const typeChecks: Preconditions<JSONValue, JSONValue>;
/**
 * objectTypeChecks for the ObjectType interface.
 */
export declare const objectTypeChecks: Preconditions<JSONValue, JSONValue>;
/**
 * arrayTypeChecks for the ArrayType interface.
 */
export declare const arrayTypeChecks: Preconditions<JSONValue, JSONValue>;
/**
 * sumTypeChecks for the SumType interface.
 */
export declare const sumTypeChecks: Preconditions<JSONValue, JSONValue>;
export declare const documentSumTypeChecks: Preconditions<JSONValue, JSONValue>;
/**
 * pluginModuleCheck
 */
export declare const pluginModuleCheck: Precondition<any, PluginModule<object>>;
/**
 * propertyCheck for the properties property of ObjectTypes.
 */
export declare const propertyCheck: Precondition<JSONValue, JSONObject>;
/**
 * documentCheck for the Document interface.
 */
export declare const documentCheck: Precondition<JSONValue, JSONObject>;
