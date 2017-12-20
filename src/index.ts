import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as nunjucks from 'nunjucks';
import * as os from 'os';
import { docopt } from 'docopt';
import { resolve as pathResolve, join as pathJoin, dirname, isAbsolute } from 'path';
import { set } from 'property-seek';
import { polate } from '@quenk/polate';
import { Either } from 'afpl';
import { fuse, merge, reduce } from 'afpl/lib/util';
import { Failure, Precondition } from '@quenk/preconditions';
import { ObjectType, documentCheck, pluginModuleCheck } from './checks';

/**
 * REF keyword.
 */
export const REF = '$ref';

/**
 * INVALID_REF error message
 */
export const INVALID_REF = 'Invalid Ref';

/**
 * DOCUMENT_PATH_SEPERATOR for property short hand.
 */
export const DOCUMENT_PATH_SEPERATOR = ':';

/**
 * CONCERN_PREFIX symbol
 */
export const CONCERN_PREFIX = '@';


/**
 * polateOptions for the polate function.
 */
export const polateOptions = { start: '\\${', end: '}', applyFunctions: true }

/**
 * errors are messages for failed preconditions.
 */
export const errors = {

    string: 'must be a string!'

};

/**
 * Arguments that are excepted from the command line.
 */
export interface Arguments {

    [key: string]: string

}

/**
 * Options for running the program.
 */
export interface Options {

    file: string,
    template: string,
    templates: string,
    contexts: string[],
    plugins: string[],
    concern: string,
    sets: string[]

}

/**
 * Program can be seen as the execution context various stages depend on.
 */
export interface Program {

    /**
     * file path of the current document being processed.
     */
    file: string,

    /**
     * concern calculated from the templates file extension.
     */
    concern: string,

    /**
     * cwd Current Working Directory.
     */
    cwd: string,

    /**
     * context of the program that code will be generated in.
     */
    context: Context,

    /**
     * document is the resulting document as it is being built.
     */
    document: Document

    /**
     * template to render
     */
    template: string,

    /**
     * engine is the templating engine used to generate code output.
     */
    engine: Engine

    /**
     * options passed on the command line.
     */
    options: Options

    /**
     * plugins to be installed.
     */
    plugins: Plugin[],

    /**
     * after are funtions that get applied to the context after processing.
     */
    after: After[]

}

/**
 * PluginModule is used to initialized plugins.
 */
export interface PluginModule<A> {

    /**
     * name of the plugin.
     */
    name: string,

    /**
     * docopt string for parsing arguments passed on the command line.
     */
    docopt: string

    /**
     * init intializes the plugin.
     */
    init: (args: A) => Plugin

}

/**
 * Plugins are allowed to modify the program before code generation.
 */
export type Plugin = (p: Program) => Promise<Program>;

/**
 * After are applied after processing.
 */
export type After = (p: Program) => Promise<Program>;

export interface JSONObject {

    [key: string]: JSONValue

};

/**
 * JSONArray represents JSON arrays.
 */
export interface JSONArray extends Array<JSONValue> { }

/**
 * JSONValue are values that can appear in a JSON document.
 */
export type JSONValue
    = JSONString
    | JSONNumber
    | JSONBoolean
    | JSONObject
    | JSONArray
    ;

/**
 * JSONNumber representation.
 */
export type JSONNumber = number;

/**
 * JSONBoolean representation.
 */
export type JSONBoolean = boolean;

/**
 * JSONString representation.
 */
export type JSONString = string;

/**
 * FilePath
 */
export type FilePath = string;

/**
 * Context
 */
export interface Context extends JSONObject {

    document: Document

}

/**
 * Document describes the top level JSON document in a file.
 */
export interface Document extends ObjectType {

    title?: string

}

/**
 * Engine that is used to render templates
 */
export type Engine = nunjucks.Environment;

/**
 * resolve -> Promise.resolve
 */
export const resolve = Promise.resolve;

/**
 * reject -> Promise.reject.
 */
export const reject = Promise.reject;

/**
 * node -> Promise.fromCallback;
 */
export const node = Promise.fromCallback;

const startsWith = (tok: string, str: any): boolean =>
    str.startsWith(tok);

const pathsResolve = (path: string) => (paths: string[]) =>
    paths.map(p => pathResolve(path, p));

/**
 * readModule reads a module into memory using node's require machinery.
 */
export const readModule = (path: string) => {
    let m = require.main.require(isAbsolute(path) ? path :
        startsWith('.', String(path)) ? require.resolve(pathJoin(process.cwd(), path)) : path);

    return m.default ? m.default : m;

}

const _resolvePlugin = (argv: string) => (p: PluginModule<object>) =>
    Promise.resolve((p.docopt !== '') ?
        p.init(docopt(p.docopt, { argv })) : p.init({}));

const _rejectPlugin = (path: string) => (f: Failure<PluginModule<object>>) =>
    Promise
        .reject(new Error(`Plugin "${path}" is invalid!\n ${JSON.stringify(f.explain())}`));

/**
 * readPlugin loads a plugin into memory.
 */
export const readPlugin = (path: string): Promise<Plugin> => {

    if ((path[0] === '[') && (path[path.length - 1] === ']')) {

        let parts = path.slice(1, path.length - 1).split(' ');
        let realPath: string = parts[0];
        let argv = parts.slice(1).join(' ').trim();

        return pluginModuleCheck(readModule(realPath))
            .map(_resolvePlugin(argv))
            .orRight(_rejectPlugin(realPath))
            .takeRight();

    } else {

        return pluginModuleCheck(readModule(path))
            .map(_resolvePlugin(''))
            .orRight(_rejectPlugin(path))
            .takeRight();

    }

}

/**
 * readFile wrapper.
 */
export const readFile = (path: string): Promise<string> =>
    node(cb => fs.readFile(path, 'utf8', cb))

/**
 * readDocument reads a document into memory.
 */
export const readDocument = (path: string): Promise<Document> => readJSONFile<Document>(path);

const _invalidJSON = <O extends JSONObject>(path: string) =>
    reject<O>(new Error(`The file "${path}" contains invalid JSON!`));

/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
export const readJSONFile = <O extends JSONObject>(p: string): Promise<O> =>
    readFile(p)
        .then(parseJSON)
        .then((e: Either<Error, O>) => e.cata(() => _invalidJSON<O>(p), o => resolve(o)));

/**
 * parseJSON from a string.
 */
export const parseJSON = <A extends JSONObject>(s: string): Either<Error, A> => {

    try {

        return Either.right<Error, A>(JSON.parse(s));

    } catch (e) {

        return Either.left<Error, A>(e);

    }

};

/**
 * createEngine creates a new configured instance of the templating engine.
 */
export const createEngine = (templates: string): Engine => {

    let e = nunjucks.configure(templates, {
        autoescape: false,
        throwOnUndefined: true,
        trimBlocks: true,
        lstripBlocks: true,
        noCache: true
    });

    let isArray = (a: any) => {

        if (typeof a === 'string')
            return a.split(',');
        if (!Array.isArray(a)) throw new Error(`'${a}' is not an Array!`);
        return a;
    };

    let isObject = (a: any) => {

        if (typeof a !== 'object')
            throw new Error(`'${a}' is not an object!`);
        return a;

    }

    e.addFilter('keys', function(o: object, remove: any[]): string[] {

        if (!Array.isArray(remove))
            return Object.keys(o);

        return Object.keys(o).filter(k => remove.indexOf(k) < 0);

    });

    e.addGlobal('isArray', Array.isArray);
    e.addGlobal('isObject', (a: any) => ((typeof a === 'object') && (!Array.isArray(a))));
    e.addGlobal('isFunction', (a: any) => (typeof a === 'function'));
    e.addGlobal('isNumber', (a: any) => (typeof a === 'number'));
    e.addGlobal('isString', (a: any) => (typeof a === 'string'));
    e.addGlobal('isBoolean', (a: any) => (typeof a === 'boolean'));
    e.addGlobal('isPrim', (a: any) => ((typeof a !== 'object') && (typeof a !== 'function')));
    e.addGlobal('merge', merge);
    e.addGlobal('fuse', merge);
    e.addGlobal('EOL', os.EOL);

    e.addFilter('prefix', (a: any[], s: string) => isArray(a).map(v => `${s}${v}`));
    e.addFilter('wrap', (a: any[], s: string) => isArray(a).map(v => `${s}${v}${s}`));
    e.addFilter('error', (a: any) => console.error(a) || a);
    e.addFilter('split', (a: string, marker = ',') => a.split(marker));

    e.addFilter('sortdict', (o: any) =>
        Object.keys(isObject(o)).sort().reduce((p: any, k) =>
            fuse(p, { [k]: o[k] }), {}));

    return e;

}

const _sets2Context = (value: string[]) => value.reduce((p, kvp) => {

    let [path, value] = kvp.split('=');

    return set(path, startsWith('require://', value) ?
        readModule(value.split('require://')[1]) : value, p);

}, {});

/**
 * options2Program converts an Options record to a a Program record.
 */
export const options2Program = (options: Options) => (document: Document): Promise<Program> =>
    Promise
        .all(options.plugins.map(readPlugin))
        .then(plugins => Promise.resolve({

            file: options.file,
            concern: options.concern,
            cwd: process.cwd(),
            document,
            template: options.template,
            engine: createEngine(options.templates),

            context: <Context>fuse(_sets2Context(options.sets),
                options.contexts.reduce((p, c) => fuse(p, readModule(c)), {})),

            options,
            plugins,
            after: <After[]>[]

        }));

const _refError = (path: string) => (e: Error) =>
    reject(new Error(`Error '${path}': ${e.stack}`));

const _fuseRef = (path: string, ref: string) =>
    (doc: JSONObject): Promise<JSONObject> =>
        readRef(pathResolve(path, ref))
            .then(ref => resolve(fuse(doc, ref)));

const _fuseRefList = (path: string, list: string[]) =>
    (doc: JSONObject): Promise<JSONObject> =>
        readRefs(pathsResolve(path)(list))
            .then((list: JSONObject[]) => resolve(list.reduce((p, c) => <JSONObject>fuse(p, c), doc)));

/**
 * resolveRef resolves the ref property on an object.
 * @todo: reduce the tornado
 */
export const resolveRef = (path: FilePath) => (json: JSONObject): Promise<JSONObject> =>
    reduce(json, (previous, current, key) =>
        (key === REF) ?
            (Array.isArray(current) ?
                previous
                    .then(_fuseRefList(dirname(path), <string[]>current)) :
                previous
                    .then(_fuseRef(dirname(path), <string>current))) :

            Array.isArray(current) ?
                (previous
                    .then(doc =>
                        resolve(current)
                            .then(resolveListRefs(path))
                            .then(v => resolve(fuse(doc, { [key]: v }))))) :

                (typeof current === 'object') ?
                    previous
                        .then(doc =>
                            resolve(current)
                                .then(resolveRef(path))
                                .then(v => resolve(fuse(doc, { [key]: v })))) :

                    previous
                        .then(doc => fuse(doc, {

                            [key]: current

                        })), resolve({}))

        .catch(_refError(path))

/**
 * resolveRefList
 */
export const resolveListRefs = (path: FilePath) => (list: JSONValue[]): Promise<JSONValue[]> =>
    list.reduce((p, c) =>
        p.then(list =>
            Array.isArray(c) ?
                resolve(c)
                    .then(resolveListRefs(path))
                    .then(m => resolve(list.concat(m))) :
                (typeof c === 'object') ?
                    resolve(c)
                        .then(resolveRef(path))
                        .then(m => resolve(list.concat(m))) :
                    resolve(list.concat(c))), resolve([]));

/**
 * readRef into memory.
 */
export const readRef = (path: FilePath): Promise<JSONValue> =>
    readDocument(path).then(resolveRef(path))

/**
 * readRefs reads multiple ref paths into memory recursively.
 */
export const readRefs = (paths: string[]): Promise<JSONValue[]> =>
    Promise.all(paths.map(readRef));

/**
 * expand short form properties in a document.
 */
export const expand = (o: JSONValue): JSONValue =>
    Array.isArray(o) ? o.map(expand) :
        (typeof o === 'object') ? reduce(o, (p, c, k) =>
            set(k.split(DOCUMENT_PATH_SEPERATOR).join('.'), expand(c), p), {}) : o;

/**
 * interpolation of variables in strings where ever they occur.
 */
export const interpolation = (context: object) => (o: JSONValue): JSONValue =>
    Array.isArray(o) ? o.map(interpolation(context)) :
        (typeof o === 'object') ? reduce(o, (p, c, k) =>
            fuse(p, { [k]: interpolation(context)(c) }), {}) :
            (typeof o === 'string') ? polate(o, context, polateOptions) : o;

/**
 * replace keys in a document based on the file extension of the provided template.
 */
export const replace = (concern: string) => (o: JSONValue): JSONValue =>
    concern === '' ? o :
        Array.isArray(o) ?
            o.map(replace(concern)) :
            (typeof o === 'object') ?
                reduce(o, (p, c, k) => startsWith(CONCERN_PREFIX, k) ?
                    (`${CONCERN_PREFIX}${concern}` === k && (typeof c === 'object')) ?
                        fuse(p, (c)) : p : fuse(p, { [k]: replace(concern)(c) }), {}) : o;

const _checkError = (schema: object) => (err: Failure<Document>) =>
    reject(new Error(
        `Error while processing schema '` +
        `${JSON.stringify(schema)}'\n: ${JSON.stringify(err.explain(errors))}`));

/**
 * check the document to ensure it conforms to the expected schema.
 */
export const check = (p: Precondition<JSONValue, JSONObject>) => (doc: Document)
    : Promise<Document> =>
    p(doc).cata(_checkError(doc), () => resolve(doc));

/**
 * contextualize places the document into the view engine context.
 */
export const contextualize = (program: Program) => (document: Document) => {

    program.document = document;
    program.context = <Context>fuse(program.context, { document });
    return program;

}

/**
 * afterwards applies the after effects
 */
export const afterwards = (prog: Program): Promise<Program> =>
    prog.after.reduce((p, c) => p.then(c), resolve(prog));

/**
 * generate program code.
 */
export const generate = (p: Program): Promise<string> =>
    (p.template) ?
        Promise
            .fromCallback(cb => p.engine.render(p.template, { context: p.context }, cb)) :
        resolve(JSON.stringify(p.context.document));

/**
 * execute the stages involved in producing code.
 */
export const execute = (prog: Program): Promise<string> =>
    prog
        .plugins
        .reduce((p, n) => p.then(n), resolve(prog))
        .then(program =>
            resolve(program.document)
                .then(resolveRef(program.file))
                .then(expand)
                .then(interpolation(program.context))
                .then(replace(program.concern))
                .then(check(documentCheck))
                .then(contextualize(program))
                .then(afterwards)
                .then(generate));
