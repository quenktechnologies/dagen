"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const future_1 = require("@quenk/noni/lib/control/monad/future");
const property_seek_1 = require("property-seek");
const path_1 = require("path");
const monad_1 = require("@quenk/noni/lib/control/monad");
const string_1 = require("@quenk/noni/lib/data/string");
const record_1 = require("@quenk/noni/lib/data/record");
const checks_1 = require("../schema/checks");
exports.MODULE_SCHEME = 'require';
exports.EVAL_SCHEME = 'eval';
/**
 * load reads a module into memory using node's require machinery.
 */
exports.load = (path) => future_1.attempt(() => {
    let p = path_1.isAbsolute(path) ? path :
        require.resolve(path_1.join(process.cwd(), path));
    let m = require.main.require(p);
    return m.default ? m.default : m;
});
/**
 * loadN loads one or more modules into memory.
 */
exports.loadN = (paths) => future_1.parallel(paths.map(exports.load));
/**
 * loadSchema into memory.
 */
exports.loadSchema = (path) => exports.load(path)
    .catch(e => future_1.raise(new Error(`Error loading schema "${path}": "${e.message}"`)));
/**
 * loadDefinitions from an array of module paths.
 */
exports.loadDefinitions = (paths) => exports.loadN(paths)
    .map(defs => defs.reduce(record_1.merge, {}))
    .catch(defsErr);
const defsErr = (e) => future_1.raise(new Error(`Failed loading one or more definitions: "${e.message}"`));
/**
 * loadPlugins from an array of plugin paths.
 */
exports.loadPlugins = (ctx, paths) => monad_1.doN(function* () {
    let mods = yield exports.loadN(paths);
    let futs = mods.map((m) => future_1.attempt(() => m(ctx)));
    return future_1.parallel(futs);
})
    .catch(pluginErr);
const pluginErr = (e) => future_1.raise(new Error(`Failed loading one or more plugins: "${e.message}"`));
/**
 * loadChecks from an array of paths.
 */
exports.loadChecks = (paths) => exports.loadN(paths)
    .chain((s) => future_1.pure(s.map(checks_1.fromSchema(new checks_1.Context()))))
    .catch(checkErr);
const checkErr = (e) => future_1.raise(new Error(`Failed loading one or more checks: "${e.message}"`));
/**
 * setValues applies setValue for each member of the pairs array.
 */
exports.setValues = (o) => (pairs) => pairs.reduce((p, c) => p.chain(o => exports.setValue(o)(c)), future_1.pure(o));
/**
 * setValue sets a value to a JSON object.
 *
 * The value to set is calculated from a key value pair
 * that supports loading module by prefixing the value with 'require://'.
 */
exports.setValue = (o) => (pair) => {
    let [path, value] = pair.split('=');
    return string_1.startsWith(exports.MODULE_SCHEME, value) ?
        exports.load(value.split(`${exports.MODULE_SCHEME}://`)[1])
            .map((m) => property_seek_1.set(path, m, o)) :
        future_1.pure(property_seek_1.set(path, value, o));
};
//# sourceMappingURL=index.js.map