"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandObject = exports.expandArray = exports.expand = exports.PATH_SEPARATOR = void 0;
const match_1 = require("@quenk/noni/lib/control/match");
const function_1 = require("@quenk/noni/lib/data/function");
const array_1 = require("@quenk/noni/lib/data/array");
const path_1 = require("@quenk/noni/lib/data/record/path");
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
exports.expandObject = (o) => path_1.unflatten(path_1.unescapeRecord(path_1.flatten(o)));
//# sourceMappingURL=index.js.map