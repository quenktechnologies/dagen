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
import * as schema from '../';

import { match } from '@quenk/noni/lib/control/match';
import { map, reduce, keys } from '@quenk/noni/lib/data/record';
import {
    Precondition,
    Preconditions,
    and,
    or,
    every,
    reject,
    identity,
    optional
} from '@quenk/preconditions';
import { fail } from '@quenk/preconditions/lib/result';

import {
    Schema,
    Schemas,
    ObjectType,
    ArrayType,
    TupleType,
    SumType
} from '../';
import { Providers } from './provider';
import { specs2Checks } from './spec';

export const TYPE_REF = 'ref';

/**
 * Check is a Precondition that accepts some JSON value as input.
 */
export type Check<T> = Precondition<json.Value, T>;

/**
 * Checks map.
 */
export type Checks<B extends json.Object> = Preconditions<json.Value, B>;

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
export class Context<B extends json.Object> {

    constructor(
        public checks: Checks<B> = {},
        public providers: Providers<json.Value> = {}) { }

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
 * fromSchema rewrites a Schema to a chain of Checks.
 *
 * The first argument is a Checks map that will be used
 * for resolving ref types. If a ref type uses a path
 * that can't be resolved the precondition will always fail.
 *
 * XXX: checks on prims/externals
 */
export const fromSchema = <B extends json.Object>
    (c: Context<B>) => (s: Schema): Check<B> => wrapOptional(s,
        addCustom(c, s, <Check<B>>match(s)
            .caseOf(schema.objectShapeWithAllProperties, fromMapObject(c))
            .caseOf(schema.objectShapeWithProperties, fromObject(c))
            .caseOf(schema.objectShapeWithAdditionalProperties, fromMap(c))
            .caseOf(schema.arrayShape, fromArray(c))
            .caseOf(schema.tupleShape, fromTuple(c))
            .caseOf(schema.sumShape, fromSum(c))
            .caseOf(schema.refShape, fromRef(c))
            .caseOf(schema.stringShape, () => strings.isString)
            .caseOf(schema.numberShape, () => numbers.isNumber)
            .caseOf(schema.booleanShape, () => booleans.isBoolean)
            .caseOf(schema.externalShape, () => identity)
            .end()));

const wrapOptional = <B extends json.Object>
    (s: Schema, ch: Check<B>): Check<B> =>
    (s.optional === true) ? <Check<B>>optional(ch) : ch;

const addCustom = <B extends json.Object>(c: Context<B>, s: Schema, ch: Check<B>): Check<B> =>
    and<any, any, any>(ch, specs2Checks(c.providers)(s.$checks || []))

const fromObject = <B extends json.Object>(c: Context<B>) => ({ properties, $checks }: ObjectType) =>
    every(records.isRecord,
        records.union(map(properties, fromSchema(c))),
        specs2Checks(c.providers)($checks || []));

const fromMap = <B extends json.Object>(c: Context<B>) => ({ additionalProperties, $checks }: ObjectType) =>
    every(records.isRecord,
        records.map(fromSchema(c)(additionalProperties)),
        specs2Checks(c.providers)($checks || []));

const fromMapObject = <B extends json.Object>(c: Context<B>) =>
    ({ properties, additionalProperties, $checks }: ObjectType) =>
        and(<Precondition<json.Value, json.Object>>records.isRecord,
            and(records.union(map(properties, fromSchema(c))),
                and(
                    records.map(fromSchema(c)(additionalProperties)),
                    <Precondition<json.Object, B>>specs2Checks(c.providers)(
                        $checks || []
                    )
                )
            )
        );

const fromArray = <B extends json.Object>(c: Context<B>) => ({ items }: ArrayType) =>
    every(arrays.isArray,
        arrays.map(fromSchema(c)(items)),
        arrays.map(specs2Checks(c.providers)(items.$checks || [])));

const fromTuple = <B extends json.Object>(c: Context<B>) => ({ items }: TupleType) =>
    every(arrays.isArray, arrays.tuple(items.map(fromSchema(c))));

const fromSum = <B extends json.Object>(c: Context<B>) => ({ variants }: SumType): Check<B> =>
    reduce(map(variants, fromSchema(c)), reject(''), or);

const fromRef = <B extends json.Object>(c: Context<B>) => ({ ref }: RefType) => refPrec(c)(ref);

const refPrec = <B extends json.Object>(c: Context<B>) => (p: string): Check<B> => (v: json.Value) =>
    c.checks.hasOwnProperty(p) ?
        c.checks[p](v) :
        fail(`unknown ref "${p}" known: ${keys(c.checks)}`, v);
