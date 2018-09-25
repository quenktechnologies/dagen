"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const property_seek_1 = require("property-seek");
const path_1 = require("path");
const string_1 = require("@quenk/noni/lib/data/string");
const record_1 = require("@quenk/noni/lib/data/record");
exports.MODULE_SCHEME = 'require';
exports.EVAL_SCHEME = 'eval';
/**
 * load reads a module into memory using node's require machinery.
 */
exports.load = (path) => Promise.try(() => {
    let p = path_1.isAbsolute(path) ? path :
        require.resolve(path_1.join(process.cwd(), path));
    let m = require.main.require(p);
    return m.default ? m.default : m;
});
/**
 * loadN loads one or more modules into memory.
 */
exports.loadN = (paths) => Promise.all(paths.map(exports.load));
/**
 * loadSchema into memory.
 */
exports.loadSchema = (path) => exports.load(path)
    .catch(e => Promise.reject(`Error loading schema "${path}": "${e.message}"`));
/**
 * loadDefinitions from an array of module paths.
 */
exports.loadDefinitions = (paths) => exports.loadN(paths)
    .then(defs => defs.reduce(record_1.merge, {}))
    .catch(defsErr);
const defsErr = (e) => Promise.reject(new Error(`Failed loading one or more definitions: "${e.message}"`));
/**
 * loadPlugins from an array of plugin paths.
 */
exports.loadPlugins = (paths) => exports.loadN(paths).catch(pluginErr);
const pluginErr = (e) => Promise.reject(new Error(`Failed loading one or more plugins: "${e.message}"`));
/**
 * loadChecks from an array of check paths.
 */
exports.loadChecks = (paths) => exports.loadN(paths).catch(checkErr);
const checkErr = (e) => Promise.reject(new Error(`Failed loading one or more checks: "${e.message}"`));
/**
 * setValues applies setValue for each member of the pairs array.
 */
exports.setValues = (o) => (pairs) => pairs.reduce((p, c) => p.then(o => exports.setValue(o)(c)), Promise.resolve(o));
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
            .then((m) => property_seek_1.set(path, m, o)) :
        Promise.resolve(property_seek_1.set(path, value, o));
};
//# sourceMappingURL=index.js.map