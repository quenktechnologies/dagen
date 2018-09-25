"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_seek_1 = require("property-seek");
const record_1 = require("@quenk/noni/lib/data/record");
const usage_1 = require("./usage");
exports.resolve = (defs) => (schema) => (usage_1.evalUsages(defs)(usage_1.pull({})('')(schema)))
    .map((wanted) => record_1.reduce(wanted, schema, _resolve));
const _resolve = (p, c, k) => property_seek_1.set(k, record_1.merge(property_seek_1.get(k, p), c), p);
//# sourceMappingURL=index.js.map