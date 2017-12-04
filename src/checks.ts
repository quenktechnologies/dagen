import { fuse } from 'afpl/lib/util';
import { isString } from '@quenk/preconditions/lib/string';
import { Preconditions, isObject, map, union, intersect } from '@quenk/preconditions/lib/object';
import { Precondition, when, and, equals, optional } from '@quenk/preconditions';
import { JSONValue, JSONObject } from './';

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

}

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
 * isUserType type guard.
 */
export const isUserType = (doc: JSONValue): doc is UserType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        ([OBJECT_TYPE, ARRAY_TYPE].indexOf(String(doc.type)) < 0)) ? true : false;

/**
 * typeChecks for the Type interface.
 */
export const typeChecks: Preconditions<JSONValue, JSONValue> = {

    type: isString

};

/**
 * objectTypeChecks for the ObjectType interface.
 */
export const objectTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(OBJECT_TYPE),

    get properties() {
        return map<JSONObject, JSONValue, JSONObject>(propertiesCheck);
    }

};

/**
 * arrayTypeChecks for the ArrayType interface.
 */
export const arrayTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(ARRAY_TYPE),
    get items() { return propertiesCheck; }

};

/**
 * sumTypeChecks for the SumType interface.
 */
export const sumTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(SUM_TYPE),
    variants: intersect<JSONObject, JSONValue, JSONObject>(typeChecks)

};

/**
 * propertiesCheck for the properties property of ObjectTypes.
 */
export const propertiesCheck: Precondition<JSONValue, JSONObject> =
    and<JSONValue, JSONObject>(isObject,
        when<JSONValue, JSONObject>(isObjectType, union<JSONObject, JSONValue, JSONObject>(objectTypeChecks),
            when<JSONObject, JSONObject>(isArrayType, union<JSONObject, JSONValue, JSONObject>(arrayTypeChecks),
                when<JSONObject, JSONObject>(isSumType, union<JSONObject, JSONValue, JSONObject>(sumTypeChecks),
                    union<JSONObject, JSONValue, JSONObject>(typeChecks)))));

/**
 * documentChecks for the Document interface.
 */
export const documentChecks: Preconditions<JSONValue, JSONValue> =
    fuse<Preconditions<JSONValue, JSONValue>, Preconditions<JSONValue, JSONValue>>
        (objectTypeChecks, { title: optional<JSONValue, JSONValue>(isString) });
