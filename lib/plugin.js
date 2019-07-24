"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
class AbstractPlugin {
    constructor(context) {
        this.context = context;
    }
    beforeOutput(s) {
        return future_1.pure(s);
    }
    configureGenerator(gen) {
        return future_1.pure(gen);
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
    beforeOutput(s) {
        if (this.empty())
            return future_1.pure(s);
        let fs = this.plugins.map(p => (s) => p.beforeOutput(s));
        return (monad_1.pipeN.apply(undefined, fs))(s);
    }
    configureGenerator(gen) {
        if (this.empty())
            return future_1.pure(gen);
        let fs = this.plugins.map(p => (g) => p.configureGenerator(g));
        return (monad_1.pipeN.apply(undefined, fs))(gen);
    }
}
exports.CompositePlugin = CompositePlugin;
//# sourceMappingURL=plugin.js.map