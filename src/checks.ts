import { isString } from '@quenk/preconditions/lib/string';
import { isFunction } from '@quenk/preconditions/lib/function';
import { match, caseOf } from '@quenk/preconditions';
import { Preconditions, isObject, restrict, map, union, intersect } from '@quenk/preconditions/lib/object';
import { Precondition, and, equals, optional } from '@quenk/preconditions';
import { JSONValue, JSONObject, PluginModule } from './';

/**
 * OBJECT_TYPE
 */
export const OBJECT_TYPE = 'object';

/**
 * ARRAY_TYPE
 */
export const ARRAY_TYPE = 'array';

/**
 * SUM_TYPE
 */
export const SUM_TYPE = 'sum';

/**
 * STRING_TYPE
 */
export const STRING_TYPE = 'string';

/**
 * NUMBER_TYPE
 */
export const NUMBER_TYPE = 'number';

/**
 * BOOLEAN_TYPE
 */
export const BOOLEAN_TYPE = 'boolean';

/**
 * Type refers to a property on a Document and describes
 * the fields that may appear.
 */
export interface Type extends JSONObject {

    /**
     * type specifies the type of a property.
     */
    type: string

}

/**
 * ObjectType describes the properties when type = 'object' is declared.
 */
export interface ObjectType extends Type {

    /**
     * properties of the object type.
     */
    properties?: {

        [key: string]: Type

    }

}

/**
 *
 * ArrayType describes the properties expected when type = 'array' is declared.
 */
export interface ArrayType extends Type {

    /**
     * items describes the what Types can be members of the array.
     */
    item: Type

}

/**
 * SumType describes the properties expected when the type = 'sum' is declared.
 */
export interface SumType extends Type {

    /**
     * variants of the sum type.
     */
    variants: { [key: string]: Type }

    /**
     * discriminator indicates who the members of the sum should be discriminated
     */
    discriminator: {

        [key: string]: JSONValue

        type: string

    }

}

/**
 * StringType describes the properties expected when the type = 'string' is declared.
 */
export interface StringType extends Type { }

export interface NumberType extends Type { }

export interface BooleanType extends Type { }

/**
 * UserType are user specified and have no constraints beyond the type field.
 */
export interface UserType extends Type { }

/**
 * isObjectType type guard.
 */
export const isObjectType = (doc: JSONValue): doc is ObjectType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc['type'] === OBJECT_TYPE)) ? true : false;

/**
 * isArrayType type guard.
 */
export const isArrayType = (doc: JSONValue): doc is ArrayType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === ARRAY_TYPE)) ? true : false;

/**
 * isSumType type guard.
 */
export const isSumType = (doc: JSONValue): doc is SumType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === SUM_TYPE)) ? true : false;

/**
 * isStringType type guard.
 */
export const isStringType = (doc: JSONValue): doc is StringType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === STRING_TYPE));

/**
 * isNumberType type guard.
 */
export const isNumberType = (doc: JSONValue): doc is NumberType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === NUMBER_TYPE));

/**
 * isBooleanType type guard.
 */
export const isBooleanType = (doc: JSONValue): doc is BooleanType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === BOOLEAN_TYPE));

/**
 * isUserType type guard.
 */
export const isUserType = (doc: JSONValue): doc is UserType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        ([OBJECT_TYPE, ARRAY_TYPE].indexOf(String(doc.type)) < 0)) ? true : false;

/**
 * pluginModuleChecks for loaded plugin modules.
 */
export const pluginModuleChecks: Preconditions<any, string | Function> = {

    name: isString,

    docopt: isString,

    init: isFunction

};

/**
 * typeChecks for the Type interface.
 */
export const typeChecks: Preconditions<JSONValue, JSONValue> = {

    type: isString

};

/**
 * discriminatorChecks for the discriminator field of sum types.
 */
export const discriminatorChecks : Preconditions<JSONValue, JSONValue> = {

  type:isString

};

/**
 * objectTypeChecks for the ObjectType interface.
 */
export const objectTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(OBJECT_TYPE),

    get properties() {
        return map<JSONObject, JSONValue, JSONObject>(propertyCheck);
    }

};

/**
 * arrayTypeChecks for the ArrayType interface.
 */
export const arrayTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(ARRAY_TYPE),
    get items() { return propertyCheck; }

};

/**
 * sumTypeChecks for the SumType interface.
 */
export const sumTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(SUM_TYPE),

  variants: and<JSONValue, JSONObject>(isObject,
    intersect<JSONObject, JSONValue, JSONObject>(typeChecks)),

  discriminator: and<JSONValue, JSONObject>(isObject,
    intersect<JSONObject, JSONValue, JSONObject>(discriminatorChecks))

};

export const documentSumTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(SUM_TYPE),

    get variants() {
        return and<JSONValue, JSONObject>(isObject, map(
            union<JSONObject, JSONValue, JSONObject>(objectTypeChecks)))
    }

}

/**
 * pluginModuleCheck
 */
export const pluginModuleCheck: Precondition<any, PluginModule<object>> =
    restrict<any, string | Function, PluginModule<object>>(pluginModuleChecks);

/**
 * propertyCheck for the properties property of ObjectTypes.
 */
export const propertyCheck: Precondition<JSONValue, JSONObject> =
    and<JSONValue, JSONObject>(isObject, match(
        caseOf({ type: OBJECT_TYPE }, union<JSONObject, JSONValue, JSONObject>(objectTypeChecks)),
        caseOf({ type: ARRAY_TYPE }, union<JSONObject, JSONValue, JSONObject>(arrayTypeChecks)),
        caseOf({ type: SUM_TYPE }, union<JSONObject, JSONValue, JSONObject>(sumTypeChecks)),
        union<JSONObject, JSONValue, JSONObject>(typeChecks)));

/**
 * documentCheck for the Document interface.
 */
export const documentCheck: Precondition<JSONValue, JSONObject> = match(
    caseOf({ type: SUM_TYPE }, union<JSONObject, JSONValue, JSONObject>(documentSumTypeChecks)),
    caseOf({ type: OBJECT_TYPE }, and<JSONValue, JSONObject>(
        union<JSONObject, JSONValue, JSONObject>({
            title: optional<JSONValue, JSONValue>(isString)
        }), union<JSONObject, JSONValue, JSONObject>(objectTypeChecks))));
