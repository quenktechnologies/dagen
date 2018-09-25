import * as Promise from 'bluebird';
import { Value, Object } from '@quenk/noni/lib/data/json';
import { merge, isRecord } from '@quenk/noni/lib/data/record';
import { either } from '@quenk/noni/lib/data/either';
import { Failure, Result } from '@quenk/preconditions/lib/result';
import { expand as pathExpand } from '../schema/path';
import { normalize } from '../schema/path/namespace';
import { Loader, load } from '../schema/loader';
import { resolve } from '../schema/definitions';
import { Check } from '../schema/checks';
import { check } from '../schema/checks/builtin';
import { Schema, expand as schemaExpand } from '../schema';
import { Definitions } from '../schema/definitions';
import { Plugin } from './plugin';

/**
 * Context compilation takes place in.
 *
 * @property namespaces - Used todistinguish which properties are in effect.
 * @property checks     - Checks to be applied to the schema once it is compiled.
 * @property loader     - Loader used to resolve fragment references.
 */
export class Context {

    constructor(
        public definitions: Definitions,
        public namespaces: string[],
        public checks: Check<Value>[],
      public loader: Loader,
    public plugins: Plugin[]) { }

    /**
     * addDefinitions to the Context.
     */
    addDefinitions(defs: Definitions): Context {

        return new Context(
            merge(this.definitions, defs),
            this.namespaces,
            this.checks,
          this.loader,
        this.plugins);

    }

}

/**
 * pathExpansion stage.
 * 
 * Nested property short-hand is expanded to full JSON object representation.
 */
export const pathExpansion = (o: Object): Promise<Object> =>
    Promise.resolve(<Object>pathExpand(o));

/**
 * nameSubstitution stage.
 *
 * During this tage the processing program calculates the effective namespace.
 */
export const namespaceSubstitution = (c: Context) => (o: Object): Promise<Object> =>
    Promise.resolve(normalize(c.namespaces)(o));

/**
 * fragmentResolution stage.
 *
 * During this stage, ref properties are recursively resolved and merged into
 * their owners.
 */
export const fragmentResolution = (c: Context) => (o: Object): Promise<Object> =>
    (load(c.loader)(o))

/**
 * schemaExpansion stage.
 *
 * During this stage, short-hand such as `"type": "string"` are expanded
 * to full JSON objects in supported places.
 */
export const schemaExpansion = (o: Object): Promise<Object> =>
    Promise.resolve(schemaExpand(o));

/**
 * definitionRegistration stage.
 *
 * During this stage, the processing program registers each definition
 * under their respective names.
 */
export const definitionRegistration = (c: Context) => (o: Object): Promise<Context> =>
    Promise
        .resolve(isRecord(o.definitions) ?
            c.addDefinitions(<Definitions>o.definitions) : c);

/**
 * definitionMerging
 * At this stage all usage of defined types are resolved.
 */
export const definitionMerging = (o: Object) => (c: Context): Promise<Object> =>
    either<Failure<Object>, Object, Promise<Object>>
        (mergingFailed(c))(mergingComplete)(resolve(c.definitions)(<Schema>o))

const mergingFailed = (c: Context) => (f: Failure<Object>): Promise<Object> =>
    Promise.reject(f.toError({}, c));

const mergingComplete = (o: Object): Promise<Object> =>
    Promise.resolve(o);

/**
 * checksStage applies schema and custom checks.
 *
 * This stage determines whether the object is fit for use.
 */
export const checkStage = (c: Context) => (o: Object) =>
    either<Failure<Value>, Value, Promise<Object>>
        (checksFailed(c))(Promise.resolve)(c.checks.reduce(chainCheck, check(o)));

const checksFailed = (c: Context) => (f: Failure<Object>): Promise<Object> =>
    Promise.reject(f.toError({}, c));

const chainCheck = (pre: Result<Value, Value>, curr: Check<Value>) =>
    <Result<Object, Value>>pre.chain(curr);

/**
 * compile a JSON document into a valid document schema.
 */
export const compile = (c: Context) => (j: Object) =>
    pathExpansion(j)
        .then(namespaceSubstitution(c))
        .then(fragmentResolution(c))
        .then(schemaExpansion)
        .then((j: Object) =>
            (definitionRegistration(c)(j))
                .then((c: Context) =>
                    (definitionMerging(j)(c))
                        .then(checkStage(c))));
