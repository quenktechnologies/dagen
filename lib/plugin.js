"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositePlugin = exports.AbstractPlugin = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
class AbstractPlugin {
    constructor(context) {
        this.context = context;
    }
    configure(c) {
        return (0, future_1.pure)(c);
    }
    checkSchema() {
        return (0, future_1.pure)([]);
    }
    beforeOutput(s) {
        return (0, future_1.pure)(s);
    }
    configureGenerator(gen) {
        return (0, future_1.pure)(gen);
    }
}
exports.AbstractPlugin = AbstractPlugin;
/**
 * CompositePlugin combines mulitple plugins into one.
 */
class CompositePlugin {
    constructor(plugins) {
        this.plugins = plugins;
    }
    /**
     * @private
     */
    empty() {
        return (this.plugins.length === 0);
    }
    configure(c) {
        if (this.empty())
            return (0, future_1.pure)(c);
        let fs = this.plugins.map(p => (c) => p.configure(c));
        return (monad_1.pipeN.apply(undefined, fs))(c);
    }
    checkSchema() {
        return (0, future_1.parallel)(this.plugins.map(p => p.checkSchema()))
            .map(list => list.reduce((p, c) => p.concat(c), []));
    }
    beforeOutput(s) {
        if (this.empty())
            return (0, future_1.pure)(s);
        let fs = this.plugins.map(p => (s) => p.beforeOutput(s));
        return (monad_1.pipeN.apply(undefined, fs))(s);
    }
    configureGenerator(gen) {
        if (this.empty())
            return (0, future_1.pure)(gen);
        let fs = this.plugins.map(p => (g) => p.configureGenerator(g));
        return (monad_1.pipeN.apply(undefined, fs))(gen);
    }
}
exports.CompositePlugin = CompositePlugin;
//# sourceMappingURL=plugin.js.map