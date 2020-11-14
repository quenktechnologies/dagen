"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const record_1 = require("@quenk/noni/lib/data/record");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const loader_1 = require("../schema/loader");
const definitions_1 = require("../schema/definitions");
const builtin_1 = require("../schema/checks/builtin");
const schema_1 = require("../schema");
/**
 * Context compilation takes place in.
 *
 * @property namespaces - Used todistinguish which properties are in effect.
 * @property checks     - Checks to be applied to the schema once it is compiled.
 * @property loader     - Loader used to resolve fragment references.
 */
class Context {
    constructor(definitions, namespaces, checks, loader) {
        this.definitions = definitions;
        this.namespaces = namespaces;
        this.checks = checks;
        this.loader = loader;
        this.plugins = maybe_1.nothing();
    }
    /**
     * addDefinitions to the Context.
     */
    addDefinitions(defs) {
        this.definitions = record_1.merge(this.definitions, defs);
        return this;
    }
    /**
     * addChecks to the context.
     */
    addChecks(checks) {
        this.checks = this.checks.concat(checks);
        return this;
    }
    /**
     * setPlugin sets the plugin to be used during compilation.
     */
    setPlugin(plugin) {
        this.plugins = maybe_1.just(plugin);
        return this;
    }
    /**
     * fragmentResolution stage.
     *
     * During this stage, ref properties are recursively resolved and merged into
     * their owners.
     */
    fragmentResolution(o) {
        return (loader_1.resolve(this.loader, this.namespaces)(o));
    }
    /**
     * schemaExpansion stage.
     *
     * During this stage, short-hand such as `"type": "string"` are expanded
     * to full JSON objects in supported places.
     */
    schemaExpansion(o) {
        return future_1.pure(schema_1.expand(o));
    }
    /**
     * definitionRegistration stage.
     *
     * During this stage, the processing program registers each definition
     * under their respective names.
     */
    definitionRegistration(o) {
        return future_1.pure(record_1.isRecord(o.definitions) ?
            this.addDefinitions(o.definitions) : this);
    }
    /**
     * definitionMerging
     * At this stage all usage of defined types are resolved.
     */
    definitionMerging(o) {
        let eresult = definitions_1.resolve(this.definitions)(o);
        return eresult.isLeft() ?
            mergingFailed(this, eresult.takeLeft()) :
            mergingComplete(eresult.takeRight());
    }
    /**
     * checksStage applies schema and custom checks.
     *
     * This stage determines whether the object is fit for use.
     */
    checkStage(o) {
        return this
            .checks
            .reduce(chainCheck, builtin_1.check(o))
            .fold(checksFailed(this), (o) => future_1.pure(o));
    }
    /**
     * compile a JSON document into a valid document schema.
     */
    compile(doc) {
        let that = this;
        return monad_1.doN(function* () {
            doc = yield that.fragmentResolution(doc);
            doc = yield that.schemaExpansion(doc);
            yield that.definitionRegistration(doc);
            doc = yield that.definitionMerging(doc);
            doc = yield that.checkStage(doc);
            if (that.plugins.isJust())
                return that.plugins.get().beforeOutput(doc);
            else
                return future_1.pure(doc);
        });
    }
}
exports.Context = Context;
const mergingFailed = (c, f) => future_1.raise(f.toError({}, c));
const mergingComplete = (o) => future_1.pure(o);
const checksFailed = (_) => (f) => future_1.raise(new Error(`${JSON.stringify(f.explain())}`));
const chainCheck = (pre, curr) => pre.chain(curr);
//# sourceMappingURL=index.js.map