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
/**
 * pluginModuleCheck
 */
export declare const pluginModuleCheck: Precondition<any, PluginModule<object>>;
/**
 * propertiesCheck for the properties property of ObjectTypes.
 */
export declare const propertiesCheck: Precondition<JSONValue, JSONObject>;
/**
 * documentChecks for the Document interface.
 */
export declare const documentChecks: Preconditions<JSONValue, JSONValue>;
