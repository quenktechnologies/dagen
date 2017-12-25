import * as Promise from 'bluebird';
import * as nunjucks from 'nunjucks';
import { Either } from 'afpl';
import { Precondition } from '@quenk/preconditions';
import { ObjectType } from './checks';
/**
 * REF keyword.
 */
export declare const REF = "$ref";
/**
 * INVALID_REF error message
 */
export declare const INVALID_REF = "Invalid Ref";
/**
 * DOCUMENT_PATH_SEPERATOR for property short hand.
 */
export declare const DOCUMENT_PATH_SEPERATOR = ":";
/**
 * CONCERN_PREFIX symbol
 */
export declare const CONCERN_PREFIX = "@";
export declare const MODULE_SCHEME = "require";
export declare const EVAL_SCHEME = "eval";
/**
 * polateOptions for the polate function.
 */
export declare const polateOptions: {
    start: string;
    end: string;
    applyFunctions: boolean;
};
/**
 * errors are messages for failed preconditions.
 */
export declare const errors: {
    string: string;
};
/**
 * Arguments that are excepted from the command line.
 */
export interface Arguments {
    [key: string]: string;
}
/**
 * Options for running the program.
 */
export interface Options {
    file: string;
    template: string;
    templates: string;
    contexts: string[];
    plugins: string[];
    concern: string;
    sets: string[];
}
/**
 * Program can be seen as the execution context various stages depend on.
 */
export interface Program {
    /**
     * file path of the current document being processed.
     */
    file: string;
    /**
     * concern calculated from the templates file extension.
     */
    concern: string;
    /**
     * cwd Current Working Directory.
     */
    cwd: string;
    /**
     * context of the program that code will be generated in.
     */
    context: Context;
    /**
     * document is the resulting document as it is being built.
     */
    document: Document;
    /**
     * template to render
     */
    template: string;
    /**
     * engine is the templating engine used to generate code output.
     */
    engine: Engine;
    /**
     * options passed on the command line.
     */
    options: Options;
    /**
     * plugins to be installed.
     */
    plugins: Plugin[];
    /**
     * after are funtions that get applied to the context after processing.
     */
    after: After[];
}
/**
 * PluginModule is used to initialized plugins.
 */
export interface PluginModule<A> {
    /**
     * name of the plugin.
     */
    name: string;
    /**
     * docopt string for parsing arguments passed on the command line.
     */
    docopt: string;
    /**
     * init intializes the plugin.
     */
    init: (args: A) => Plugin;
}
/**
 * Plugins are allowed to modify the program before code generation.
 */
export declare type Plugin = (p: Program) => Promise<Program>;
/**
 * After are applied after processing.
 */
export declare type After = (p: Program) => Promise<Program>;
export interface JSONObject {
    [key: string]: JSONValue;
}
/**
 * JSONArray represents JSON arrays.
 */
export interface JSONArray extends Array<JSONValue> {
}
/**
 * JSONValue are values that can appear in a JSON document.
 */
export declare type JSONValue = JSONString | JSONNumber | JSONBoolean | JSONObject | JSONArray;
/**
 * JSONNumber representation.
 */
export declare type JSONNumber = number;
/**
 * JSONBoolean representation.
 */
export declare type JSONBoolean = boolean;
/**
 * JSONString representation.
 */
export declare type JSONString = string;
/**
 * FilePath
 */
export declare type FilePath = string;
/**
 * Context
 */
export interface Context extends JSONObject {
    document?: Document;
}
/**
 * Document describes the top level JSON document in a file.
 */
export interface Document extends ObjectType {
    title?: string;
}
/**
 * Engine that is used to render templates
 */
export declare type Engine = nunjucks.Environment;
/**
 * resolve -> Promise.resolve
 */
export declare const resolve: typeof Promise.resolve;
/**
 * reject -> Promise.reject.
 */
export declare const reject: typeof Promise.reject;
/**
 * node -> Promise.fromCallback;
 */
export declare const node: typeof Promise.fromCallback;
/**
 * readModule reads a module into memory using node's require machinery.
 */
export declare const readModule: (path: string) => any;
/**
 * readPlugin loads a plugin into memory.
 */
export declare const readPlugin: (path: string) => Promise<Plugin>;
/**
 * readFile wrapper.
 */
export declare const readFile: (path: string) => Promise<string>;
/**
 * readDocument reads a document into memory.
 */
export declare const readDocument: (path: string) => Promise<Document>;
/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
export declare const readJSONFile: <O extends JSONObject>(p: string) => Promise<O>;
/**
 * parseJSON from a string.
 */
export declare const parseJSON: <A extends JSONObject>(s: string) => Either<Error, A>;
/**
 * createEngine creates a new configured instance of the templating engine.
 */
export declare const createEngine: (templates: string) => nunjucks.Environment;
/**
 * options2Program converts an Options record to a a Program record.
 */
export declare const options2Program: (options: Options) => (document: Document) => Promise<Program>;
/**
 * resolveRef resolves the ref property on an object.
 * @todo: reduce the tornado
 */
export declare const resolveRef: (program: Program) => (path: string) => (json: JSONObject) => Promise<JSONObject>;
/**
 * resolveRefList
 */
export declare const resolveListRefs: (program: Program) => (path: string) => (list: JSONValue[]) => Promise<JSONValue[]>;
/**
 * readRef into memory.
 */
export declare const readRef: (program: Program) => (path: string) => Promise<JSONValue>;
/**
 * readRefs reads multiple ref paths into memory recursively.
 */
export declare const readRefs: (program: Program) => (paths: string[]) => Promise<JSONValue[]>;
/**
 * evaluate allows for the recursive procsessing of json values.
 *
 * It provides interpolation, expansion and replacement based on the
 * Program configuration.
 */
export declare const evaluate: (program: Program) => (path: string) => Promise<JSONValue>;
/**
 * expand short form properties in a document.
 */
export declare const expand: (o: JSONValue) => JSONValue;
/**
 * interpolation of variables in strings whereever they occur.
 */
export declare const interpolation: (context: object) => (o: JSONValue) => JSONValue;
/**
 * replace keys in a document based on the file extension of the provided template.
 */
export declare const replace: (concern: string) => (o: JSONValue) => JSONValue;
/**
 * check the document to ensure it conforms to the expected schema.
 */
export declare const check: (p: Precondition<JSONValue, JSONObject>) => (doc: Document) => Promise<Document>;
/**
 * contextualize places the document into the view engine context.
 */
export declare const contextualize: (program: Program) => (document: Document) => Program;
/**
 * afterwards applies the after effects
 */
export declare const afterwards: (prog: Program) => Promise<Program>;
/**
 * generate program code.
 */
export declare const generate: (p: Program) => Promise<string>;
/**
 * execute the stages involved in producing code.
 */
export declare const execute: (prog: Program) => Promise<string>;
