"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_seek_1 = require("property-seek");
const match_1 = require("@quenk/noni/lib/control/match");
const function_1 = require("@quenk/noni/lib/data/function");
const array_1 = require("@quenk/noni/lib/data/array");
const record_1 = require("@quenk/noni/lib/data/record");
exports.PATH_SEPARATOR = '.';
/**
 * expand the paths of a JSON value authored in short-form recursively.
 */
exports.expand = (val) => match_1.match(val)
    .caseOf(Array, exports.expandArray)
    .caseOf(Object, exports.expandObject)
    .orElse(function_1.cons(val))
    .end();
exports.expandArray = (function_1.flip(array_1.map)(exports.expand));
exports.expandObject = (o) => record_1.reduce(record_1.flatten(o), {}, (p, c, k) => property_seek_1.set(k, c, p));
//# sourceMappingURL=index.js.map