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
import { doN, DoFn } from '@quenk/noni/lib/control/monad';
import { Maybe, nothing, just } from '@quenk/noni/lib/data/maybe';

/**
 * Plugin for the compiler.
 */
export interface Plugin {

    /**
     * beforeOutput is applied to the schema before output of te 
     * generated code.
     */
    beforeOutput(s: Schema): Future<Schema>

}

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
        public loader: Loader) { }

    plugins: Maybe<Plugin> = nothing();

    /**
     * addDefinitions to the Context.
     */
    addDefinitions(defs: Definitions): Context {

        this.definitions = merge(this.definitions, defs);

        return this;

    }

    /**
     * setPlugin sets the plugin to be used during compilation.
     */
    setPlugin(plugin: Plugin): Context {

        this.plugins = just(plugin);

        return this;

    }

    /**
     * fragmentResolution stage.
     *
     * During this stage, ref properties are recursively resolved and merged into
     * their owners.
     */
    fragmentResolution(o: Object): Future<Object> {

        return (resolve(this.loader, this.namespaces)(o))

    }

    /**
     * schemaExpansion stage.
     *
     * During this stage, short-hand such as `"type": "string"` are expanded
     * to full JSON objects in supported places.
     */
    schemaExpansion(o: Object): Future<Object> {

        return pure(schemaExpand(o));

    }

    /**
     * definitionRegistration stage.
     *
     * During this stage, the processing program registers each definition
     * under their respective names.
     */
    definitionRegistration(o: Object): Future<Context> {

        return pure(isRecord(o.definitions) ?
            this.addDefinitions(<Definitions>o.definitions) : this);

    }

    /**
     * definitionMerging
     * At this stage all usage of defined types are resolved.
     */
    definitionMerging(o: Object): Future<Object> {

        return either<Failure<Object>, Object, Future<Object>>
            (mergingFailed(this))(mergingComplete)(
                defResolve(this.definitions)(<Schema>o))

    }

    /**
     * checksStage applies schema and custom checks.
     *
     * This stage determines whether the object is fit for use.
     */
    checkStage(o: Object) {

        return this
            .checks
            .reduce(chainCheck, check(o))
            .fold(checksFailed(this), (o: Object) => pure(o));

    }

    /**
     * compile a JSON document into a valid document schema.
     */
    compile(doc: Object): Future<Object> {

        let that = this;

        return doN(<DoFn<Object, Future<Object>>>function*() {

            doc = yield that.fragmentResolution(doc);

            doc = yield that.schemaExpansion(doc);

            yield that.definitionRegistration(doc);

            doc = yield that.definitionMerging(doc);

            doc = yield that.checkStage(doc);

            if (that.plugins.isJust())
                return that.plugins.get().beforeOutput(<Schema>doc);
            else
                return pure(doc);

        });

    }

}

const mergingFailed = (c: Context) => (f: Failure<Object>): Future<Object> =>
    raise(f.toError({}, c));

const mergingComplete = (o: Object): Future<Object> =>
    pure(o);

const checksFailed = (_: Context) => (f: Failure<Object>): Future<Object> =>
    raise(new Error(`${JSON.stringify(f.explain())}`));

const chainCheck = (pre: Result<Value, Value>, curr: Check<Value>) =>
    <Result<Object, Value>>pre.chain(curr);
