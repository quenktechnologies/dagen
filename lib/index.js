"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Promise = require("bluebird");
const nunjucks = require("nunjucks");
const path_1 = require("path");
const property_seek_1 = require("property-seek");
const polate_1 = require("@quenk/polate");
const afpl_1 = require("afpl");
const util_1 = require("afpl/lib/util");
const object_1 = require("@quenk/preconditions/lib/object");
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
/**
 * readModule reads a module into memory using node's require machinery.
 */
exports.readModule = (path) => {
    let m = require.main.require(path_1.isAbsolute(path) ? path :
        startsWith('.', String(path)) ? require.resolve(path_1.join(process.cwd(), path)) : path);
    return m.default ? m.default : m;
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
    e.addFilter('prefix', (a, s) => isArray(a).map(v => `${s}${v}`));
    e.addFilter('wrap', (a, s) => isArray(a).map(v => `${s}${v}${s}`));
    e.addFilter('error', (a) => console.error(a) || a);
    e.addFilter('split', (a, marker = ',') => a.split(marker));
    e.addFilter('sortdict', (o) => Object.keys(isObject(o)).sort().reduce((p, k) => util_1.merge(p, { [k]: o[k] }), {}));
    return e;
};
/**
 * options2Program converts an Options record to a a Program record.
 */
exports.options2Program = (options) => (document) => ({
    file: options.file,
    concern: options.concern,
    cwd: process.cwd(),
    document,
    template: options.template,
    engine: exports.createEngine(options.templates),
    context: options.contexts.reduce((p, c) => util_1.fuse(p, exports.readModule(c)), {}),
    options,
    plugins: options.plugins.map(exports.readModule),
    after: []
});
const _refError = (path) => (e) => exports.reject(new Error(`Error '${path}': ${e.stack}`));
/**
 * resolveRef resolves the ref property on an object.
 * @todo: reduce the tornado
 */
exports.resolveRef = (path) => (json) => util_1.reduce(json, (previous, current, key) => (key === exports.REF) ?
    (Array.isArray(current) ?
        previous
            .then(doc => Promise
            .all(current.map(p => path_1.resolve(path_1.dirname(path), String(p))))
            .then(list => list.reduce(util_1.merge, doc))) :
        previous
            .then(doc => exports.readRef(path_1.resolve(path_1.dirname(path), String(current)))
            .then(ref => util_1.merge(doc, ref)))) :
    Array.isArray(current) ?
        (previous
            .then(doc => exports.resolve(current)
            .then(exports.resolveListRefs(path))
            .then(v => exports.resolve(util_1.merge(doc, { [key]: v }))))) :
        (typeof current === 'object') ?
            (previous
                .then(doc => exports.resolve(current)
                .then(exports.resolveRef(path))
                .then(r => util_1.merge(doc, { [key]: r })))) :
            (typeof current === 'object') ?
                previous
                    .then(doc => exports.resolve(current)
                    .then(exports.resolveRef(path))
                    .then(v => exports.resolve(util_1.merge(doc, { [key]: v })))) :
                previous
                    .then(doc => util_1.merge(doc, {
                    [key]: current
                })), exports.resolve({}))
    .catch(_refError(path));
/**
 * resolveRefList
 */
exports.resolveListRefs = (path) => (list) => list.reduce((p, c) => p.then(list => Array.isArray(c) ?
    exports.resolve(c)
        .then(exports.resolveListRefs(path))
        .then(m => exports.resolve(list.concat(m))) :
    (typeof c === 'object') ?
        exports.resolve(c)
            .then(exports.resolveRef(path))
            .then(m => exports.resolve(list.concat(m))) :
        exports.resolve(list.concat(c))), exports.resolve([]));
/**
 * readRef into memory.
 */
exports.readRef = (path) => exports.readDocument(path).then(exports.resolveRef(path));
/**
 * expand short form properties in a document.
 */
exports.expand = (o) => Array.isArray(o) ? o.map(exports.expand) :
    (typeof o === 'object') ? util_1.reduce(o, (p, c, k) => property_seek_1.set(k.split(exports.DOCUMENT_PATH_SEPERATOR).join('.'), exports.expand(c), p), {}) : o;
/**
 * interpolation of variables in strings where ever they occur.
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
    .then(exports.resolveRef(program.file))
    .then(exports.expand)
    .then(exports.interpolation(program.context))
    .then(exports.replace(program.concern))
    .then(exports.check(object_1.union(checks_1.documentChecks)))
    .then(exports.contextualize(program))
    .then(exports.afterwards)
    .then(exports.generate));
//# sourceMappingURL=index.js.map