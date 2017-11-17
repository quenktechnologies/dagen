#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Promise = require("bluebird");
var bluebird = require("bluebird");
var nunjucks = require("nunjucks");
var docopt = require("docopt");
var afpl = require("afpl");
var afpl_1 = require("afpl");
var util_1 = require("afpl/lib/util");
var ProcedureExtension_1 = require("./ProcedureExtension");
var node = bluebird.fromCallback;
exports.readFile = function (path) {
    return node(function (cb) { return fs.readFile(path, 'utf8', cb); });
};
/**
 * render a template using nunjucks.
 */
exports.render = function (t, c, opts) {
    var _a = opts.views, views = _a === void 0 ? process.cwd() : _a, contextOnly = opts.contextOnly;
    var e = new nunjucks.Environment([new nunjucks.FileSystemLoader(views)], {
        autoescape: false,
        throwOnUndefined: true,
        trimBlocks: true,
        lstripBlocks: true,
        noCache: true
    });
    var isArray = function (a) {
        if (typeof a === 'string')
            return a.split(',');
        if (!Array.isArray(a))
            throw new Error("'" + a + "' is not an Array!");
        return a;
    };
    var isObject = function (a) {
        if (typeof a !== 'object')
            throw new Error("'" + a + "' is not an object!");
        return a;
    };
    e.addFilter('keys', function (o, remove) {
        if (!Array.isArray(remove))
            return Object.keys(o);
        return Object.keys(o).filter(function (k) { return remove.indexOf(k) < 0; });
    });
    e.addFilter('prefix', function (a, s) { return isArray(a).map(function (v) { return "" + s + v; }); });
    e.addFilter('wrap', function (a, s) { return isArray(a).map(function (v) { return "" + s + v + s; }); });
    e.addFilter('error', function (a) { return console.error(a) || a; });
    e.addFilter('split', function (a, marker) {
        if (marker === void 0) { marker = ','; }
        return a.split(marker);
    });
    e.addFilter('sortdict', function (o) {
        return Object.keys(isObject(o)).sort().reduce(function (p, k) {
            return afpl.util.merge(p, (_a = {}, _a[k] = o[k], _a));
            var _a;
        }, {});
    });
    e.addExtension('Procedure', new ProcedureExtension_1.ProcedureExtension());
    e.addExtension('Function', new ProcedureExtension_1.FunctionExtension());
    return node(function (cb) { return contextOnly ?
        cb(null, JSON.stringify(c)) : e.render(t, c, cb); });
};
/**
 * parseJSON wraps around the native JSON.parse.
 */
exports.parseJSON = function (s) {
    try {
        return afpl_1.Either.right(JSON.parse(s));
    }
    catch (e) {
        return afpl_1.Either.left(e);
    }
};
/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
exports.readJSONFile = function (p) {
    return exports.readFile(p)
        .then(exports.parseJSON)
        .then(function (e) { return e.cata(_reject, _readJSONDeeper(path.dirname(p))); });
};
var _readJSONDeeper = function (path) { return function (o) {
    return afpl.util.reduce(o, function (p, c, k) {
        return p.then(function (e) {
            return e.cata(_reject, function (a) {
                return c.hasOwnProperty('$ref') ?
                    _readIntoObject(c, k, a, path) :
                    _mergeIntoObject(c, k, a);
            });
        });
    }, _resolve({}));
}; };
var _readIntoObject = function (r, key, o, p) {
    return exports.readJSONFile(path.resolve(p, r.$ref)).then(function (e) {
        return e.map(function (v) {
            return util_1.fuse(o, (_a = {}, _a[key] = util_1.except(['$ref'], r), _a), (_b = {}, _b[key] = v, _b));
            var _a, _b;
        });
    });
};
var _mergeIntoObject = function (o2, key, o1) {
    return Promise.resolve(afpl_1.Either.right(util_1.merge(o1, (_a = {}, _a[key] = o2, _a))));
    var _a;
};
var _reject = function (e) {
    return Promise.reject(afpl_1.Either.left(e));
};
var _resolve = function (o) {
    return Promise.resolve(afpl_1.Either.right(o));
};
/**
 * inflate converts the compact form of processor directives into
 * their own objects.
 */
exports.inflate = function (o) {
    return afpl.util.reduce(o, function (p, c, k) {
        var keys = k.split(':');
        var space = keys[0], key = keys[1];
        if (keys.length === 1)
            return util_1.merge(p, (_a = {}, _a[k] = typeof c === 'object' ? exports.inflate(c) : c, _a));
        return util_1.fuse(p, (_b = {}, _b[space] = (_c = {}, _c[key] = typeof c === 'object' ? exports.inflate(c) : c, _c), _b));
        var _a, _b, _c;
    }, {});
};
/**
 * extract from a Schema only the part that deals with a specific
 * processor.
 */
exports.extract = function (proc, s) {
    return afpl.util.reduce(s, function (p, c, k) {
        return (k[0] !== '@' && c.hasOwnProperty(proc)) ?
            afpl.util.merge(p, (_a = {}, _a[k] = c[proc], _a)) : p;
        var _a;
    }, {});
};
/**
 * strip processor directives from the schema.
 */
exports.strip = function (s) {
    return afpl.util.reduce(s, function (p, c, k) {
        return (k[0] === '@') ? p : afpl.util.merge(p, (_a = {}, _a[k] = c, _a));
        var _a;
    });
};
/**
 * groupByTable constructs a new schema by grouping columns according
 * to the table specificer.
 */
exports.groupByTable = function (s, main) {
    return afpl.util.reduce(s, function (p, c, k) {
        return afpl.util.fuse(p, (_a = {},
            _a[c.hasOwnProperty('table') ? c.table : main] = (_b = {}, _b[k] = c, _b),
            _a));
        var _a, _b;
    }, {});
};
/**
 * filter provides a list of keys that satisfy a condition.
 */
exports.filter = function (s, fn) {
    return Object.keys(s).filter(function (k) { return fn(s[k]); });
};
var _output = function (o) { return function (s) {
    var tables = exports.groupByTable(exports.extract('@sql', s), s['@sql']['table']);
    var columns = exports.extract('@sql', exports.strip(s));
    var sql = s['@sql'];
    var keys = Object.keys(exports.extract('@sql', exports.strip(s)));
    var ro = exports.filter(columns, function (c) { return c.hasOwnProperty('ro'); });
    return exports.render(o.template, {
        sql: sql,
        tables: tables,
        columns: columns,
        keys: keys,
        ro: ro
    }, o);
}; };
var _defaults = { '@sql': { key: { type: 'INT', name: 'id' } } };
/**
 * execute the program.
 */
exports.execute = function (opts) {
    return opts.generate ?
        exports.render(opts.file, {}, opts) :
        exports.readJSONFile(opts.file)
            .then(function (e) {
            return e
                .map(exports.inflate)
                .map(function (a) { return util_1.fuse(_defaults, a); })
                .cata(Promise.reject, _output(opts));
        });
};
exports.args2Options = function (args) {
    return ({
        file: args['<file>'],
        template: args['-t'],
        views: args['-v'],
        contextOnly: args['--context-only'],
        generate: args['--generate']
    });
};
var args = docopt.docopt("\n\nUsage:\n   dasql (-t TEMPLATE -v VIEWS) [options] <file>\n   dasql (-v VIEWS --generate) <file>\n\nOptions:\n  -h --help          Show this screen.\n  -t TEMPLATE        Specify the path to a template to use.\n  -v VIEWS           Specify the path templates should be looked up from.\n  --generate         Only generate a template. Treats <file> as the template.\n  --context-only     Prints the context for the templates to STDOUT.\n  --version          Show version.\n", {
    version: require('../package.json').version
});
exports.execute(exports.args2Options(args))
    .then(console.log)
    .catch(console.error);
//# sourceMappingURL=sql.js.map