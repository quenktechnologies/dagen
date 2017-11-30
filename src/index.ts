import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as nunjucks from 'nunjucks';
import { resolve as pathResolve, join as pathJoin, dirname, isAbsolute } from 'path';
import { set } from 'property-seek';
import { polate } from '@quenk/polate';
import { Either } from 'afpl';
import { merge, fuse, reduce } from 'afpl/lib/util';
import {
    map,
    when,
    and,
    equals,
    optional,
    partial,
    visit,
    object as isObject,
    string as isString,
    Failure,
    Precondition,
    Preconditions
} from '@quenk/preconditions';

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
 * OBJECT_TYPE
 */
export const OBJECT_TYPE = 'object';

/**
 * ARRAY_TYPE
 */
export const ARRAY_TYPE = 'array';

/**
 * SUM_TYPE
 */
export const SUM_TYPE = 'sum';

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
    concern: string

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
export type JSONArray
    = (JSONString | JSONNumber | JSONBoolean | JSONObject)[]
    ;

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
 * Type refers to a property on a Document and describes
 * the fields that may appear.
 */
export interface Type extends JSONObject {

    /**
     * type specifies the type of a property.
     */
    type: string

}

/**
 * ObjectType describes the properties when type = 'object' is declared.
 */
export interface ObjectType extends Type {

    /**
     * properties of the object type.
     */
    properties?: {

        [key: string]: Type

    }

}

/**
 *
 * ArrayType describes the properties expected when type = 'array' is declared.
 */
export interface ArrayType extends Type {

    /**
     * items describes the what Types can be members of the array.
     */
    item: Type

}

/**
 * SumType describes the properties expected when the type = 'sum' is declared.
 */
export interface SumType extends Type {

    /**
     * variants of the sum type.
     */
    variants: { [key: string]: Type }

}

/**
 * UserType are user specified and have no constraints beyond the type field.
 */
export interface UserType extends Type { }

/**
 * isObjectType type guard.
 */
export const isObjectType = (doc: JSONValue): doc is ObjectType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc['type'] === OBJECT_TYPE)) ? true : false;

/**
 * isArrayType type guard.
 */
export const isArrayType = (doc: JSONValue): doc is ArrayType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === ARRAY_TYPE)) ? true : false;

/**
 * isSumType type guard.
 */
export const isSumType = (doc: JSONValue): doc is SumType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        (doc.type === SUM_TYPE)) ? true : false;

/**
 * isUserType type guard.
 */
export const isUserType = (doc: JSONValue): doc is UserType =>
    ((typeof doc === 'object') &&
        (!Array.isArray(doc)) &&
        ([OBJECT_TYPE, ARRAY_TYPE].indexOf(String(doc.type)) < 0)) ? true : false;


/**
 * typeChecks for the Type interface.
 */
export const typeChecks: Preconditions<JSONValue, JSONValue> = {

    type: isString

};

/**
 * objectTypeChecks for the ObjectType interface.
 */
export const objectTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(OBJECT_TYPE),

    get properties() {
        return  visit<JSONObject, JSONValue, JSONObject>(propertiesCheck);
    }

};

/**
 * arrayTypeChecks for the ArrayType interface.
 */
export const arrayTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(ARRAY_TYPE),
    get items() { return propertiesCheck; }

};

/**
 * sumTypeChecks for the SumType interface.
 */
export const sumTypeChecks: Preconditions<JSONValue, JSONValue> = {

    type: equals<JSONValue, JSONValue>(SUM_TYPE),
    variants: partial<JSONObject, JSONValue, JSONObject>(typeChecks)

};

/**
 * propertiesCheck for the properties property of ObjectTypes.
 */
export const propertiesCheck: Precondition<JSONValue, JSONObject> =
    and<JSONValue, JSONObject>(isObject,
        when<JSONValue, JSONObject>(isObjectType, map<JSONObject, JSONValue, JSONObject>(objectTypeChecks),
            when<JSONObject, JSONObject>(isArrayType, map<JSONObject, JSONValue, JSONObject>(arrayTypeChecks),
                when<JSONObject, JSONObject>(isSumType, map<JSONObject, JSONValue, JSONObject>(sumTypeChecks),
                    map<JSONObject, JSONValue, JSONObject>(typeChecks)))));

/**
 * documentChecks for the Document interface.
 */
export const documentChecks: Preconditions<JSONValue, JSONValue> =
    fuse<Preconditions<JSONValue, JSONValue>, Preconditions<JSONValue, JSONValue>>
        (objectTypeChecks, { title: optional<JSONValue, JSONValue>(isString) });

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

/**
 * readModule reads a module into memory using node's require machinery.
 */
export const readModule = (path: string) => {
    let m = require.main.require(isAbsolute(path) ? path :
        startsWith('.', String(path)) ? require.resolve(pathJoin(process.cwd(), path)) : path);

    return m.default ? m.default : m;

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

    e.addFilter('prefix', (a: any[], s: string) => isArray(a).map(v => `${s}${v}`));
    e.addFilter('wrap', (a: any[], s: string) => isArray(a).map(v => `${s}${v}${s}`));
    e.addFilter('error', (a: any) => console.error(a) || a);
    e.addFilter('split', (a: string, marker = ',') => a.split(marker));

    e.addFilter('sortdict', (o: any) =>
        Object.keys(isObject(o)).sort().reduce((p: any, k) =>
            merge(p, { [k]: o[k] }), {}));

    return e;

}

/**
 * options2Program converts an Options record to a a Program record.
 */
export const options2Program = (options: Options) => (document: Document): Program => ({

    file: options.file,
    concern: options.concern,
    cwd: process.cwd(),
    document,
    template: options.template,
    engine: createEngine(options.templates),
    context: <Context>options.contexts.reduce((p, c) => fuse(p, readModule(c)), {}),
    options,
    plugins: <Plugin[]>options.plugins.map(readModule),
    after: <After[]>[]

});

const _refError = (path: string) => (e: Error) =>
    reject(new Error(`Error '${path}': ${e.stack}`));

/**
 * resolveRef resolves the ref property on an object.
 * @todo: reduce the tornado
 */
export const resolveRef = (path: FilePath) => (json: JSONObject): Promise<JSONObject> =>
    reduce(json, (previous, current, key) =>
        (key === REF) ?
            (Array.isArray(current) ?
                previous
                    .then(doc =>
                        Promise
                            .all(current.map(p => pathResolve(dirname(path), String(p))))
                            .then(list => list.reduce(merge, doc))) :
                previous
                    .then(doc => readRef(pathResolve(dirname(path), String(current)))
                        .then(ref => merge(doc, ref)))) :

            Array.isArray(current) ?
                (previous
                    .then(doc =>
                        resolve(current)
                            .then(resolveListRefs(path))
                            .then(v => resolve(merge(doc, { [key]: v }))))) :

                (typeof current === 'object') ?
                    (previous
                        .then(doc =>
                            resolve(current)
                                .then(resolveRef(path))
                                .then(r => merge(doc, { [key]: r })))) :

                    (typeof current === 'object') ?
                        previous
                            .then(doc =>
                                resolve(current)
                                    .then(resolveRef(path))
                                    .then(v => resolve(merge(doc, { [key]: v })))) :

                        previous
                            .then(doc => merge(doc, {

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
export const check = (p: Precondition<JSONObject, JSONObject>) => (doc: Document): Promise<Document> =>
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
                .then(check(map<JSONObject, JSONValue, JSONObject>(documentChecks)))
                .then(contextualize(program))
                .then(afterwards)
                .then(generate));
