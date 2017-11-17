/// <reference path="../src/docopt.d.ts" />
import * as Promise from 'bluebird';
import { Either } from 'afpl';
export interface Arguments {
    '-t': string;
    '-v': string;
    '<file>': string;
    '--generate': boolean;
    '--context-only': boolean;
}
/**
 * Options for running the program.
 */
export interface Options {
    file: string;
    template: string;
    views: string;
    contextOnly: boolean;
    generate: boolean;
}
export interface Schema<A extends object> {
    [key: string]: A;
}
export interface Column<A> {
    [key: string]: string | A;
    table?: string;
}
export interface JFile {
    [key: string]: any;
}
export interface Ref extends JFile {
    $ref: 'string';
}
export declare const readFile: (path: string) => Promise<string>;
/**
 * render a template using nunjucks.
 */
export declare const render: <A extends object>(t: string, c: A, opts: Options) => Promise<string>;
/**
 * parseJSON wraps around the native JSON.parse.
 */
export declare const parseJSON: <A extends object>(s: string) => Either<Error, A>;
/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
export declare const readJSONFile: <O extends object>(p: string) => Promise<Either<Error, O>>;
/**
 * inflate converts the compact form of processor directives into
 * their own objects.
 */
export declare const inflate: <O extends {
    [key: string]: A;
}, A>(o: O) => O;
/**
 * extract from a Schema only the part that deals with a specific
 * processor.
 */
export declare const extract: <O extends {
    [key: string]: A;
}, A>(proc: string, s: Schema<O>) => Schema<O>;
/**
 * strip processor directives from the schema.
 */
export declare const strip: <O extends {
    [key: string]: A;
}, A>(s: Schema<O>) => Schema<O>;
/**
 * groupByTable constructs a new schema by grouping columns according
 * to the table specificer.
 */
export declare const groupByTable: <A>(s: Schema<Column<A>>, main: string) => {};
/**
 * filter provides a list of keys that satisfy a condition.
 */
export declare const filter: <A>(s: Schema<Column<A>>, fn: (a: Column<A>) => boolean) => string[];
/**
 * execute the program.
 */
export declare const execute: (opts: Options) => Promise<string>;
export declare const args2Options: (args: Arguments) => Options;
