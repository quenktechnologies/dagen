import { Value, Object } from '@quenk/noni/lib/data/json';
import { merge, isRecord } from '@quenk/noni/lib/data/record';
import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { either } from '@quenk/noni/lib/data/either';
import { Failure } from '@quenk/preconditions/lib/result/failure';
import { Result } from '@quenk/preconditions/lib/result';
import { Loader, resolve } from '../schema/loader';
import { resolve as defResolve } from '../schema/definitions';
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
 * fragmentResolution stage.
 *
 * During this stage, ref properties are recursively resolved and merged into
 * their owners.
 */
export const fragmentResolution = (c: Context) => (o: Object): Future<Object> =>
    (resolve(c.loader, c.namespaces)(o))

/**
 * schemaExpansion stage.
 *
 * During this stage, short-hand such as `"type": "string"` are expanded
 * to full JSON objects in supported places.
 */
export const schemaExpansion = (o: Object): Future<Object> =>
    pure(schemaExpand(o));

/**
 * definitionRegistration stage.
 *
 * During this stage, the processing program registers each definition
 * under their respective names.
 */
export const definitionRegistration = (c: Context) => (o: Object): Future<Context> =>
    pure(isRecord(o.definitions) ?
        c.addDefinitions(<Definitions>o.definitions) : c);

/**
 * definitionMerging
 * At this stage all usage of defined types are resolved.
 */
export const definitionMerging = (o: Object) => (c: Context): Future<Object> =>
    either<Failure<Object>, Object, Future<Object>>
        (mergingFailed(c))(mergingComplete)(defResolve(c.definitions)(<Schema>o))

const mergingFailed = (c: Context) => (f: Failure<Object>): Future<Object> =>
    raise(f.toError({}, c));

const mergingComplete = (o: Object): Future<Object> =>
    pure(o);

/**
 * checksStage applies schema and custom checks.
 *
 * This stage determines whether the object is fit for use.
 */
export const checkStage = (c: Context) => (o: Object) =>
    c
        .checks
        .reduce(chainCheck, check(o))
        .fold(checksFailed(c), (o: Object) => pure(o));

const checksFailed = (c: Context) => (f: Failure<Object>): Future<Object> =>
    raise(f.toError({}, c));

const chainCheck = (pre: Result<Value, Value>, curr: Check<Value>) =>
    <Result<Object, Value>>pre.chain(curr);

/**
 * compile a JSON document into a valid document schema.
 */
export const compile = (c: Context) => (j: Object) =>
    pure(j)
        .chain(fragmentResolution(c))
        .chain(schemaExpansion)
        .chain((j: Object) =>
            (definitionRegistration(c)(j))
                .chain((c: Context) =>
                    (definitionMerging(j)(c))
                        .chain(checkStage(c))));

