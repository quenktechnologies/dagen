"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nunjucks_1 = require("nunjucks");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const builtin_1 = require("./builtin");
/**
 * Nunjucks output generators.
 */
class Nunjucks {
    constructor(template, env) {
        this.template = template;
        this.env = env;
    }
    static create(template, loaders) {
        return new Nunjucks(template, addFilters(addFunctions(new nunjucks_1.Environment([loaders], {
            autoescape: false,
            throwOnUndefined: true,
            trimBlocks: true,
            lstripBlocks: true,
            noCache: true
        }))));
    }
    render(document) {
        return future_1.fromCallback(cb => (this.env.render(this.template, { document }, cb)));
    }
}
exports.Nunjucks = Nunjucks;
const addFunctions = (env) => record_1.reduce(builtin_1.functions, env, (p, c, k) => p.addGlobal(k, c));
const addFilters = (env) => record_1.reduce(builtin_1.filters, env, (p, c, k) => p.addFilter(k, c));
//# sourceMappingURL=index.js.map