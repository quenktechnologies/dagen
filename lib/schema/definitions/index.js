"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = void 0;
const property_seek_1 = require("property-seek");
const record_1 = require("@quenk/noni/lib/data/record");
const usage_1 = require("./usage");
const resolve = (defs) => (schema) => ((0, usage_1.evalUsages)(defs)((0, usage_1.pull)({})('')(schema)))
    .map((wanted) => (0, record_1.reduce)(wanted, schema, _resolve));
exports.resolve = resolve;
const _resolve = (p, c, k) => (0, property_seek_1.set)(k, (0, record_1.merge)((0, property_seek_1.get)(k, p), c), p);
//# sourceMappingURL=index.js.map