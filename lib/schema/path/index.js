"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.expandObject = exports.expandArray = exports.expand = exports.PATH_SEPARATOR = void 0;
const match_1 = require("@quenk/noni/lib/control/match");
const function_1 = require("@quenk/noni/lib/data/function");
const array_1 = require("@quenk/noni/lib/data/array");
const path_1 = require("@quenk/noni/lib/data/record/path");
exports.PATH_SEPARATOR = '.';
/**
 * expand the paths of a JSON value authored in short-form recursively.
 */
const expand = (val) => (0, match_1.match)(val)
    .caseOf(Array, exports.expandArray)
    .caseOf(Object, exports.expandObject)
    .orElse((0, function_1.cons)(val))
    .end();
exports.expand = expand;
exports.expandArray = ((0, function_1.flip)(array_1.map)(exports.expand));
const expandObject = (o) => (0, path_1.unflatten)((0, path_1.unescapeRecord)((0, path_1.flatten)(o)));
exports.expandObject = expandObject;
/**
 * evaluate whether the provided path expression is true.
 *
 * In the future this may evolve into a tiny DSL but for now it just
 * checks a path to see if it is truthy.
 */
const evaluate = (doc, expr) => (0, path_1.unsafeGet)(expr, doc) == true;
exports.evaluate = evaluate;
//# sourceMappingURL=index.js.map