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
import { map, reduce, keys } from '@quenk/noni/lib/data/record';
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
import { Providers, specs2Checks } from './spec';

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
 * Context Checks are applied in.
 *
 * Holds useful data used during the transformation process.
 */
export class Context<B> {

    constructor(
        public checks: Checks<B> = {},
        public providers: Providers<B> = {}) { }

    /**
     * addChecks to the Context from a Schemas map.
     *
     * Note: This mutates this context.
     */
    addChecks(s: Schemas): Context<B> {

        this.checks = reduce(s, this.checks, (p: Checks<B>, c: Schema, k) => {

            p[k] = fromSchema(this)(c);

            return p;

        });

        return this;

    }

}

/**
 * fromSchemas turns a Schemas map into a Checks map.
export const fromSchemas = <B>(ctx:Context) => (s: Schemas): Checks<B> => {

    let checks: Checks<B> = {};

    return reduce(s, checks, (p: Checks<B>, c: Schema, k) => {

        p[k] = fromSchema(p)(c);

        return p;

    });

};
 */

/**
 * fromSchema rewrites a Schema to a chain of Checks.
 *
 * The first argument is a Checks map that will be used
 * for resolving ref types. If a ref type uses a path
 * that can't be resolved the precondition will always fail.
 */
export const fromSchema =
    <B>(c: Context<B>) => (s: Schema): Check<B> => wrapOptional(s,
        addCustom(c, s, <Check<B>>match(s)
            .caseOf(objectShapeWithBothProps, fromMapObject(c))
            .caseOf(objectShapeWithProps, fromObject(c))
            .caseOf(objectShapeWithAdditionalProps, fromMap(c))
            .caseOf(arrayShape, fromArray(c))
            .caseOf(sumShape, fromSum(c))
            .caseOf(refShape, fromRef(c))
            .caseOf(stringShape, () => strings.isString)
            .caseOf(numberShape, () => numbers.isNumber)
            .caseOf(booleanShape, () => booleans.isBoolean)
            .caseOf(externalShape, () => identity)
            .end()));

const wrapOptional = <B>(s: Schema, ch: Check<B>): Check<B> =>
    (s.optional === true) ? <Check<B>>optional(ch) : ch;

const addCustom = <B>(c: Context<B>, s: Schema, ch: Check<B>): Check<B> =>
    and<any, any>(ch, specs2Checks(c.providers)(s.$checks || []))

const fromObject = <B>(c: Context<B>) => ({ properties, $checks }: ObjectType) =>
    every(records.isObject,
        records.disjoint(map(properties, fromSchema(c))),
        specs2Checks(c.providers)($checks || []));

const fromMap = <B>(c: Context<B>) => ({ additionalProperties, $checks }: ObjectType) =>
    every(records.isObject,
        records.map(fromSchema(c)(additionalProperties)),
        specs2Checks(c.providers)($checks || []));

const fromMapObject =
    <B>(c: Context<B>) => ({ properties, additionalProperties, $checks }: ObjectType) =>
        every(records.isObject,
            records.disjoint(map(properties, fromSchema(c))),
            records.map(fromSchema(c)(additionalProperties)),
            specs2Checks(c.providers)($checks || []));

const fromArray = <B>(c: Context<B>) => ({ items }: ArrayType) =>
    every(arrays.isArray,
        arrays.map(fromSchema(c)(items)),
        arrays.map(specs2Checks(c.providers)(items.$checks || [])));

const fromSum = <B>(c: Context<B>) => ({ variants }: SumType) =>
    reduce(map(variants, fromSchema(c)), fail(''), or);

const fromRef = <B>(c: Context<B>) => ({ ref }: RefType) => refPrec(c)(ref);

const refPrec = <B>(c: Context<B>) => (p: string): Check<B> => (v: json.Value) =>
    c.checks.hasOwnProperty(p) ?
        c.checks[p](v) :
        failure(`unknown ref "${p}" known: ${keys(c.checks)}`, v);
