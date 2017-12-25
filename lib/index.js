"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Promise = require("bluebird");
const nunjucks = require("nunjucks");
const os = require("os");
const docopt_1 = require("docopt");
const path_1 = require("path");
const property_seek_1 = require("property-seek");
const polate_1 = require("@quenk/polate");
const afpl_1 = require("afpl");
const util_1 = require("afpl/lib/util");
const checks_1 = require("./checks");
/**
 * REF keyword.
 */
exports.REF = '$ref';
/**
 * INVALID_REF error message
 */
exports.INVALID_REF = 'Invalid Ref';
/**
 * DOCUMENT_PATH_SEPERATOR for property short hand.
 */
exports.DOCUMENT_PATH_SEPERATOR = ':';
/**
 * CONCERN_PREFIX symbol
 */
exports.CONCERN_PREFIX = '@';
exports.MODULE_SCHEME = 'require';
exports.EVAL_SCHEME = 'eval';
/**
 * polateOptions for the polate function.
 */
exports.polateOptions = { start: '\\${', end: '}', applyFunctions: true };
/**
 * errors are messages for failed preconditions.
 */
exports.errors = {
    string: 'must be a string!'
};
;
/**
 * resolve -> Promise.resolve
 */
exports.resolve = Promise.resolve;
/**
 * reject -> Promise.reject.
 */
exports.reject = Promise.reject;
/**
 * node -> Promise.fromCallback;
 */
exports.node = Promise.fromCallback;
const startsWith = (tok, str) => str.startsWith(tok);
const pathsResolve = (path) => (paths) => paths.map(p => path_1.resolve(path, p));
/**
 * readModule reads a module into memory using node's require machinery.
 */
exports.readModule = (path) => {
    let p = path_1.isAbsolute(path) ? path :
        startsWith('.', String(path)) ?
            require.resolve(path_1.join(process.cwd(), path)) :
            path;
    let m = require.main.require(p);
    return m.default ? m.default : m;
};
const _resolvePlugin = (argv) => (p) => Promise.resolve((p.docopt !== '') ?
    p.init(docopt_1.docopt(p.docopt, { argv })) : p.init({}));
const _rejectPlugin = (path) => (f) => Promise
    .reject(new Error(`Plugin "${path}" is invalid!\n ${JSON.stringify(f.explain())}`));
/**
 * readPlugin loads a plugin into memory.
 */
exports.readPlugin = (path) => {
    if ((path[0] === '[') && (path[path.length - 1] === ']')) {
        let parts = path.slice(1, path.length - 1).split(' ');
        let realPath = parts[0];
        let argv = parts.slice(1).join(' ').trim();
        return checks_1.pluginModuleCheck(exports.readModule(realPath))
            .map(_resolvePlugin(argv))
            .orRight(_rejectPlugin(realPath))
            .takeRight();
    }
    else {
        return checks_1.pluginModuleCheck(exports.readModule(path))
            .map(_resolvePlugin(''))
            .orRight(_rejectPlugin(path))
            .takeRight();
    }
};
/**
 * readFile wrapper.
 */
exports.readFile = (path) => exports.node(cb => fs.readFile(path, 'utf8', cb));
/**
 * readDocument reads a document into memory.
 */
exports.readDocument = (path) => exports.readJSONFile(path);
const _invalidJSON = (path) => exports.reject(new Error(`The file "${path}" contains invalid JSON!`));
/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
exports.readJSONFile = (p) => exports.readFile(p)
    .then(exports.parseJSON)
    .then((e) => e.cata(() => _invalidJSON(p), o => exports.resolve(o)));
/**
 * parseJSON from a string.
 */
exports.parseJSON = (s) => {
    try {
        return afpl_1.Either.right(JSON.parse(s));
    }
    catch (e) {
        return afpl_1.Either.left(e);
    }
};
/**
 * createEngine creates a new configured instance of the templating engine.
 */
exports.createEngine = (templates) => {
    let e = nunjucks.configure(templates, {
        autoescape: false,
        throwOnUndefined: true,
        trimBlocks: true,
        lstripBlocks: true,
        noCache: true
    });
    let isArray = (a) => {
        if (typeof a === 'string')
            return a.split(',');
        if (!Array.isArray(a))
            throw new Error(`'${a}' is not an Array!`);
        return a;
    };
    let isObject = (a) => {
        if (typeof a !== 'object')
            throw new Error(`'${a}' is not an object!`);
        return a;
    };
    e.addFilter('keys', function (o, remove) {
        if (!Array.isArray(remove))
            return Object.keys(o);
        return Object.keys(o).filter(k => remove.indexOf(k) < 0);
    });
    e.addGlobal('isArray', Array.isArray);
    e.addGlobal('isObject', (a) => ((typeof a === 'object') && (!Array.isArray(a))));
    e.addGlobal('isFunction', (a) => (typeof a === 'function'));
    e.addGlobal('isNumber', (a) => (typeof a === 'number'));
    e.addGlobal('isString', (a) => (typeof a === 'string'));
    e.addGlobal('isBoolean', (a) => (typeof a === 'boolean'));
    e.addGlobal('isPrim', (a) => ((typeof a !== 'object') && (typeof a !== 'function')));
    e.addGlobal('isArrayType', checks_1.isArrayType);
    e.addGlobal('isObjectType', checks_1.isObjectType);
    e.addGlobal('isStringType', checks_1.isStringType);
    e.addGlobal('isNumberType', checks_1.isNumberType);
    e.addGlobal('isBooleanType', checks_1.isBooleanType);
    e.addGlobal('isSumType', checks_1.isSumType);
    e.addGlobal('merge', util_1.merge);
    e.addGlobal('fuse', util_1.merge);
    e.addGlobal('get', property_seek_1.get);
    e.addGlobal('set', property_seek_1.set);
    e.addGlobal('put', (k, v, o) => { o[k] = v; return ''; });
    e.addGlobal('EOL', os.EOL);
    e.addFilter('prefix', (a, s) => isArray(a).map(v => `${s}${v}`));
    e.addFilter('wrap', (a, s) => isArray(a).map(v => `${s}${v}${s}`));
    e.addFilter('error', (msg) => { throw new Error(msg); });
    e.addFilter('console', (a, fac) => { console[fac](a); return a; });
    e.addFilter('split', (a, marker = ',') => a.split(marker));
    e.addFilter('sortdict', (o) => Object.keys(isObject(o)).sort().reduce((p, k) => util_1.fuse(p, { [k]: o[k] }), {}));
    return e;
};
const _fuseContexts = (ctx, path) => util_1.fuse(ctx, exports.readModule(path));
const _set2Context = (values) => (program) => Promise.resolve(values.reduce((p, kvp) => p.then(prog => {
    let [path, value] = kvp.split('=');
    let dest = `context.${path}`;
    return startsWith(exports.MODULE_SCHEME, value) ?
        exports.resolve(property_seek_1.set(dest, exports.readModule(value.split(`${exports.MODULE_SCHEME}://`)[1]), prog)) :
        startsWith(exports.EVAL_SCHEME, value) ?
            exports.resolve(value.split(`${exports.EVAL_SCHEME}://`)[1])
                .then(exports.evaluate(prog))
                .then(v => exports.resolve(property_seek_1.set(dest, v, prog))) :
            exports.resolve(property_seek_1.set(dest, value, prog));
}), exports.resolve(program)));
/**
 * options2Program converts an Options record to a a Program record.
 */
exports.options2Program = (options) => (document) => Promise
    .all(options.plugins.map(exports.readPlugin))
    .then(plugins => exports.resolve({
    file: options.file,
    concern: options.concern,
    cwd: process.cwd(),
    document,
    template: options.template,
    engine: exports.createEngine(options.templates),
    context: {},
    options,
    plugins,
    after: []
}))
    .then(prog => exports.resolve(options.contexts.reduce(_fuseContexts, {}))
    .then(ctx => property_seek_1.set('context', ctx, prog))
    .then(_set2Context(options.sets)));
const _refError = (path) => {
    if (!path)
        throw new Error('not path');
    return (e) => exports.reject(new Error(`Error occured while processing ref path '${path}': ${e.stack}`));
};
const _fuseRef = (path, ref, program) => (doc) => exports.readRef(program)(path_1.resolve(path, ref))
    .then(ref => exports.resolve(util_1.fuse(doc, ref)));
const _fuseRefList = (path, list, program) => (doc) => exports.readRefs(program)(pathsResolve(path)(list))
    .then((list) => exports.resolve(list.reduce((p, c) => util_1.fuse(p, c), doc)));
/**
 * resolveRef resolves the ref property on an object.
 * @todo: reduce the tornado
 */
exports.resolveRef = (program) => (path) => (json) => util_1.reduce(json, (previous, current, key) => (key === exports.REF) ?
    (Array.isArray(current) ?
        previous
            .then(_fuseRefList(path_1.dirname(path), current, program)) :
        previous
            .then(_fuseRef(path_1.dirname(path), current, program))) :
    Array.isArray(current) ?
        (previous
            .then(doc => exports.resolve(current)
            .then(exports.resolveListRefs(program)(path))
            .then(v => exports.resolve(util_1.fuse(doc, { [key]: v }))))) :
        (typeof current === 'object') ?
            previous
                .then(doc => exports.resolve(current)
                .then(exports.resolveRef(program)(path))
                .then(v => exports.resolve(util_1.fuse(doc, { [key]: v })))) :
            previous
                .then(doc => util_1.fuse(doc, {
                [key]: current
            })), exports.resolve({}))
    .catch(_refError(path));
/**
 * resolveRefList
 */
exports.resolveListRefs = (program) => (path) => (list) => list.reduce((p, c) => p.then(list => Array.isArray(c) ?
    exports.resolve(c)
        .then(exports.resolveListRefs(program)(path))
        .then(m => exports.resolve(list.concat(m))) :
    (typeof c === 'object') ?
        exports.resolve(c)
            .then(exports.resolveRef(program)(path))
            .then(m => exports.resolve(list.concat(m))) :
        exports.resolve(list.concat(c))), exports.resolve([]));
/**
 * readRef into memory.
 */
exports.readRef = (program) => (path) => exports.resolve(path)
    .then(exports.evaluate(program))
    .then(exports.resolveRef(program)(path));
/**
 * readRefs reads multiple ref paths into memory recursively.
 */
exports.readRefs = (program) => (paths) => Promise.all(paths.map(exports.readRef(program)));
/**
 * evaluate allows for the recursive procsessing of json values.
 *
 * It provides interpolation, expansion and replacement based on the
 * Program configuration.
 */
exports.evaluate = (program) => (path) => exports.resolve(exports.readModule(path))
    .then(json => Array.isArray(json) ?
    Promise
        .all(json.map(exports.evaluate(program))) :
    (typeof json === 'object') ?
        exports.resolve(json)
            .then(exports.interpolation(program.context))
            .then(exports.expand)
            .then(exports.replace(program.concern))
            .then(exports.resolveRef(program)(path)) :
        exports.resolve(json));
/**
 * expand short form properties in a document.
 */
exports.expand = (o) => Array.isArray(o) ? o.map(exports.expand) :
    (typeof o === 'object') ? util_1.reduce(o, (p, c, k) => property_seek_1.set(k.split(exports.DOCUMENT_PATH_SEPERATOR).join('.'), exports.expand(c), p), {}) : o;
/**
 * interpolation of variables in strings whereever they occur.
 */
exports.interpolation = (context) => (o) => Array.isArray(o) ? o.map(exports.interpolation(context)) :
    (typeof o === 'object') ? util_1.reduce(o, (p, c, k) => util_1.fuse(p, { [k]: exports.interpolation(context)(c) }), {}) :
        (typeof o === 'string') ? polate_1.polate(o, context, exports.polateOptions) : o;
/**
 * replace keys in a document based on the file extension of the provided template.
 */
exports.replace = (concern) => (o) => concern === '' ? o :
    Array.isArray(o) ?
        o.map(exports.replace(concern)) :
        (typeof o === 'object') ?
            util_1.reduce(o, (p, c, k) => startsWith(exports.CONCERN_PREFIX, k) ?
                (`${exports.CONCERN_PREFIX}${concern}` === k && (typeof c === 'object')) ?
                    util_1.fuse(p, (c)) : p : util_1.fuse(p, { [k]: exports.replace(concern)(c) }), {}) : o;
const _checkError = (schema) => (err) => exports.reject(new Error(`Error while processing schema '` +
    `${JSON.stringify(schema)}'\n: ${JSON.stringify(err.explain(exports.errors))}`));
/**
 * check the document to ensure it conforms to the expected schema.
 */
exports.check = (p) => (doc) => p(doc).cata(_checkError(doc), () => exports.resolve(doc));
/**
 * contextualize places the document into the view engine context.
 */
exports.contextualize = (program) => (document) => {
    program.document = document;
    program.context = util_1.fuse(program.context, { document });
    return program;
};
/**
 * afterwards applies the after effects
 */
exports.afterwards = (prog) => prog.after.reduce((p, c) => p.then(c), exports.resolve(prog));
/**
 * generate program code.
 */
exports.generate = (p) => (p.template) ?
    Promise
        .fromCallback(cb => p.engine.render(p.template, { context: p.context }, cb)) :
    exports.resolve(JSON.stringify(p.context.document));
/**
 * execute the stages involved in producing code.
 */
exports.execute = (prog) => prog
    .plugins
    .reduce((p, n) => p.then(n), exports.resolve(prog))
    .then(program => exports.resolve(program.document)
    .then(exports.resolveRef(program)(program.file))
    .then(exports.expand)
    .then(exports.interpolation(program.context))
    .then(exports.replace(program.concern))
    .then(exports.check(checks_1.documentCheck))
    .then(exports.contextualize(program))
    .then(exports.afterwards)
    .then(exports.generate));
//# sourceMappingURL=index.js.map