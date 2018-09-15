/**
 * The checks module provides functions for validating a JSON document
 * against a Data Document Schema using the Checks Extension features.
 */
import * as json from '@quenk/noni/lib/data/json';
import * as arrays from '@quenk/preconditions/lib/array';
import * as records from '@quenk/preconditions/lib/record';
import * as strings from '@quenk/preconditions/lib/string';
import * as numbers from '@quenk/preconditions/lib/number';
import * as booleans from '@quenk/preconditions/lib/boolean';
import { match } from '@quenk/noni/lib/control/match';
import { map, reduce } from '@quenk/noni/lib/data/record';
import {
    Precondition,
    and,
    or,
    every,
    fail,
    identity,
    optional
} from '@quenk/preconditions';
import { failure } from '@quenk/preconditions/lib/result';
import {
    TYPE_OBJECT,
    TYPE_ARRAY,
    TYPE_SUM,
    TYPE_STRING,
    TYPE_NUMBER,
    TYPE_BOOLEAN,
    Schema,
    Schemas,
    ObjectType,
    ArrayType,
    SumType
} from '../';

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

const refShape = {

    type: 'ref',

    ref: String

}

export const TYPE_REF = 'ref';

/**
 * Check is a Precondition that accepts some JSON value as input.
 */
export type Check<B> = Precondition<json.Value, B>;

/**
 * Checks map.
 */
export type Checks<B> = records.Preconditions<json.Value, B>;

/**
 * RefType schema.
 */
export interface RefType extends Schema {

    ref: string

}

/**
 * fromSchemas turns a Schemas map into a Checks map.
 */
export const fromSchemas = <B>(s: Schemas): Checks<B> => {

    let checks: Checks<B> = {};

    return reduce(s, checks, (p: Checks<B>, c: Schema, k) => {

        p[k] = fromSchema(p)(c);

        return p;

    });

};

/**
 * fromSchema rewrites a Schema to a chain of Checks.
 *
 * The first argument is a Checks map that will be used
 * for resolving ref types. If a ref type uses a path
 * that can't be resolved the precondition will always fail.
 */
export const fromSchema =
    <B>(i: Checks<B>) => (s: Schema): Check<B> => wrapOptional(s, <Check<B>>match(s)
        .caseOf(objectShapeWithBothProps, fromMapObject(i))
        .caseOf(objectShapeWithProps, fromObject(i))
        .caseOf(objectShapeWithAdditionalProps, fromMap(i))
        .caseOf(arrayShape, fromArray(i))
        .caseOf(sumShape, fromSum(i))
        .caseOf(refShape, fromRef(i))
        .caseOf(stringShape, () => strings.isString)
        .caseOf(numberShape, () => numbers.isNumber)
        .caseOf(booleanShape, () => booleans.isBoolean)
        .caseOf(externalShape, () => identity)
        .end());

const wrapOptional = <B>(s: Schema, ch: Check<B>): Check<B> =>
  (s.optional === true) ? <Check<B>>optional(ch) : ch;

const fromObject = <B>(i: Checks<B>) => ({ properties }: ObjectType) =>
    and(records.isObject, records.disjoint(map(properties, fromSchema(i))));

const fromMap = <B>(i: Checks<B>) => ({ additionalProperties }: ObjectType) =>
    and(records.isObject, records.map(fromSchema(i)(additionalProperties)));

const fromMapObject =
    <B>(i: Checks<B>) => ({ properties, additionalProperties }: ObjectType) =>
        every(records.isObject, records.disjoint(map(properties, fromSchema(i))),
            records.map(fromSchema(i)(additionalProperties)));

const fromArray = <B>(i: Checks<B>) => ({ items }: ArrayType) =>
    and(arrays.isArray, arrays.map(fromSchema(i)(items)));

const fromSum = <B>(i: Checks<B>) => ({ variants }: SumType) =>
    reduce(map(variants, fromSchema(i)), fail(''), or);

const fromRef = <B>(i: Checks<B>) => ({ ref }: RefType) => refPrec(i)(ref);

const refPrec = <B>(i: Checks<B>) => (p: string): Check<B> => (v: json.Value) =>
    i.hasOwnProperty(p) ? i[p](v) : failure(`unknown ref "${p}"`, v);
