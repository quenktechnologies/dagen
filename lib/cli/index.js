"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.setValues = exports.convertCheckSchema = exports.loadChecks = exports.loadPlugins = exports.loadDefinitions = exports.loadSchema = exports.loadN = exports.load = exports.EVAL_SCHEME = exports.MODULE_SCHEME = void 0;
const path_1 = require("path");
const property_seek_1 = require("property-seek");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const string_1 = require("@quenk/noni/lib/data/string");
const record_1 = require("@quenk/noni/lib/data/record");
const checks_1 = require("../schema/checks");
exports.MODULE_SCHEME = 'require';
exports.EVAL_SCHEME = 'eval';
/**
 * load reads a module into memory using node's require machinery.
 */
const load = (path) => (0, future_1.attempt)(() => {
    let p = (0, path_1.isAbsolute)(path) ? path :
        require.resolve((0, path_1.join)(process.cwd(), path));
    let m = require.main.require(p);
    return m.default ? m.default : m;
});
exports.load = load;
/**
 * loadN loads one or more modules into memory.
 */
const loadN = (paths) => (0, future_1.parallel)(paths.map(exports.load));
exports.loadN = loadN;
/**
 * loadSchema into memory.
 */
const loadSchema = (path) => path ?
    (0, exports.load)(path)
        .catch(e => (0, future_1.raise)(new Error(`Error loading schema "${path}": "${e.message}"`))) :
    (0, future_1.pure)({ type: 'object', title: 'Object', additionalProperties: {} });
exports.loadSchema = loadSchema;
/**
 * loadDefinitions from an array of module paths.
 */
const loadDefinitions = (paths) => (0, exports.loadN)(paths)
    .map(defs => defs.reduce(record_1.merge, {}))
    .catch(defsErr);
exports.loadDefinitions = loadDefinitions;
const defsErr = (e) => (0, future_1.raise)(new Error(`Failed loading one or more definitions: "${e.message}"`));
/**
 * loadPlugins from an array of plugin paths.
 */
const loadPlugins = (ctx, paths) => (0, future_1.doFuture)(function* () {
    let mods = yield (0, exports.loadN)(paths);
    return (0, future_1.parallel)(mods.map((m) => (0, future_1.attempt)(() => {
        if (typeof m.create !== 'function')
            throw new Error(`Plugins must export a create function!`);
        return m.create(ctx);
    })))
        .catch((e) => (0, future_1.raise)(new Error(`Failed loading one or more plugins: ` +
        `"${e.message}"`)));
});
exports.loadPlugins = loadPlugins;
/**
 * loadChecks from an array of paths.
 */
const loadChecks = (paths, list = []) => (0, exports.loadN)(paths)
    .chain((s) => (0, future_1.pure)(s.concat(list).map((0, checks_1.fromSchema)(new checks_1.Context()))))
    .catch(checkErr);
exports.loadChecks = loadChecks;
const checkErr = (e) => (0, future_1.raise)(new Error(`Failed loading one or more checks: "${e.message}"`));
/**
 * loadChecks from an array of paths.
 */
const convertCheckSchema = (s = []) => (0, future_1.pure)(s.map((0, checks_1.fromSchema)(new checks_1.Context())));
exports.convertCheckSchema = convertCheckSchema;
/**
 * setValues applies setValue for each member of the pairs array.
 */
const setValues = (o) => (pairs) => pairs.reduce((p, c) => p.chain(o => (0, exports.setValue)(o)(c)), (0, future_1.pure)(o));
exports.setValues = setValues;
/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
const setValue = (o) => (pair) => {
    let [path, value] = pair.split('=');
    return (0, string_1.startsWith)(exports.MODULE_SCHEME, value) ?
        (0, exports.load)(value.split(`${exports.MODULE_SCHEME}://`)[1])
            .map((m) => (0, property_seek_1.set)(path, m, o)) :
        (0, future_1.pure)((0, property_seek_1.set)(path, value, o));
};
exports.setValue = setValue;
//# sourceMappingURL=index.js.map