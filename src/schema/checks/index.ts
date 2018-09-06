/**
 * The checks module provides functions for validating a JSON document
 * against a Data Document Schema using the Checks Extension features.
 */
import * as json from '@quenk/noni/lib/data/json';
import * as arrays from '@quenk/preconditions/lib/array';
import * as objects from '@quenk/preconditions/lib/object';
import * as strings from '@quenk/preconditions/lib/string';
import * as numbers from '@quenk/preconditions/lib/number';
import * as booleans from '@quenk/preconditions/lib/boolean';
import { match } from '@quenk/noni/lib/control/match';
import { map, reduce } from '@quenk/noni/lib/data/record';
import { Precondition, and, or, every, fail, identity } from '@quenk/preconditions';
import {
    TYPE_OBJECT,
    TYPE_ARRAY,
    TYPE_SUM,
    TYPE_STRING,
    TYPE_NUMBER,
    TYPE_BOOLEAN,
    Schema,
    ObjectType,
    ArrayType,
    SumType
} from '../';


/**
 * Check is a Precondition that accepts some JSON value as input.
 */
export type Check<B> = Precondition<json.Value, B>;

const objectShapeWithBothProps = {

    type: TYPE_OBJECT,

    properties: Object,

    additionalProperties: Object

};

const objectShapeWithProps = {

    type: TYPE_OBJECT,

    properties: Object

}

const objectShapeWithAdditionalProps = {

    type: TYPE_OBJECT,

    additionalProperties: Object

}

const arrayShape = {

    type: TYPE_ARRAY,

    items: Object

}

const sumShape = {

    type: TYPE_SUM,

    variants: Object

}

const stringShape = {

    type: TYPE_STRING

}

const numberShape = {

    type: TYPE_NUMBER

}

const booleanShape = {

    type: TYPE_BOOLEAN

}

const externalShape = {

    type: String

}

/**
 * fromSchema rewrites a Schema to a chain of Checks.
 */
export const fromSchema = <B>(s: Schema): Check<B> => <Check<B>>match(s)
    .caseOf(objectShapeWithBothProps, fromMapObject)
    .caseOf(objectShapeWithProps, fromObject)
    .caseOf(objectShapeWithAdditionalProps, fromMap)
    .caseOf(arrayShape, fromArray)
    .caseOf(sumShape, fromSum)
    .caseOf(stringShape, () => strings.isString)
    .caseOf(numberShape, () => numbers.isNumber)
    .caseOf(booleanShape, () => booleans.isBoolean)
    .caseOf(externalShape, () => identity)
    .end();

const fromObject = ({ properties }: ObjectType) =>
    and(objects.isObject, objects.disjoint(map(properties, fromSchema)));

const fromMap = ({ additionalProperties }: ObjectType) =>
    and(objects.isObject, objects.map(fromSchema(additionalProperties)));

const fromMapObject = ({ properties, additionalProperties }: ObjectType) =>
    every(objects.isObject, objects.disjoint(map(properties, fromSchema)),
        objects.map(fromSchema(additionalProperties)));

const fromArray = ({ items }: ArrayType) =>
    and(arrays.isArray, arrays.map(fromSchema(items)));

const fromSum = ({ variants }: SumType) =>
    reduce(map(variants, fromSchema), fail(''), or)
