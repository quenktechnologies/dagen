#! /usr/bin/env node
///<reference path='docopt.d.ts'/>
import * as path from 'path';
import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as bluebird from 'bluebird';
import * as nunjucks from 'nunjucks';
import * as docopt from 'docopt';
import * as afpl from 'afpl';
import { Either } from 'afpl';
import { merge, fuse, except } from 'afpl/lib/util';
import { ProcedureExtension, FunctionExtension } from './ProcedureExtension';

export interface Arguments {

    '-t': string,
    '-v': string,
    '<file>': string,
    '--generate': boolean,
    '--context-only': boolean

}

/**
 * Options for running the program.
 */
export interface Options {

    file: string,
    template: string,
    views: string,
    contextOnly: boolean,
    generate:boolean

}

export interface Schema<A extends object> {

    [key: string]: A

}

export interface Column<A> {

    [key: string]: string | A

    table?: string

}

export interface JFile {

    [key: string]: any

}

export interface Ref extends JFile {

    $ref: 'string'

}

const node = bluebird.fromCallback;

export const readFile = (path: string): Promise<string> =>
    node(cb => fs.readFile(path, 'utf8', cb))

/**
 * render a template using nunjucks.
 */
export const render = <A extends object>(t: string, c: A, opts: Options): Promise<string> => {

    let { views = process.cwd(), contextOnly } = opts;

    let e = new nunjucks.Environment([new nunjucks.FileSystemLoader(views)], {
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
            afpl.util.merge(p, { [k]: o[k] }), {}));

    e.addExtension('Procedure', new ProcedureExtension());
    e.addExtension('Function', new FunctionExtension());

    return node(cb => contextOnly ?
        cb(null, JSON.stringify(c)) : e.render(t, c, cb));

}

/**
 * parseJSON wraps around the native JSON.parse.
 */
export const parseJSON = <A extends object>(s: string): Either<Error, A> => {

    try {

        return Either.right<Error, A>(JSON.parse(s));

    } catch (e) {

        return Either.left<Error, A>(e);

    }

};

/**
 * readJSONFile recursively reads a json file and treats any
 * top level keys that are strings to as paths to more json.
 */
export const readJSONFile = <O extends object>(p: string)
    : Promise<Either<Error, O>> =>
    readFile(p)
        .then(parseJSON)
        .then(e => e.cata(_reject, _readJSONDeeper(path.dirname(p))))

const _readJSONDeeper = <O extends JFile>(path: string) => (o: O): Promise<Either<Error, O>> =>
    afpl.util.reduce(o, (p, c, k) =>
        p.then(e =>
            e.cata(_reject, a =>
                c.hasOwnProperty('$ref') ?
                    _readIntoObject(c, k, a, path) :
                    _mergeIntoObject(c, k, a))),
        _resolve<O>(<O>{}));

const _readIntoObject = <O extends Ref>(r: O, key: string, o: O, p: string) =>
    readJSONFile(path.resolve(p, r.$ref)).then(e =>
        e.map(v =>
            fuse<object, object>(o, { [key]: except(['$ref'], r) }, { [key]: v })));

const _mergeIntoObject = <O extends object>(o2: O, key: string, o1: O) =>
    Promise.resolve(Either.right<Error, O>(merge<O, O>(o1, ({ [key]: o2 } as any))));

const _reject = <O>(e: Error) =>
    Promise.reject(Either.left<Error, O>(e));

const _resolve = <O>(o: O) =>
    Promise.resolve(Either.right<Error, O>(o));

/**
 * inflate converts the compact form of processor directives into
 * their own objects.
 */
export const inflate = <O extends { [key: string]: A }, A>(o: O): O =>
    afpl.util.reduce(o, (p, c, k) => {

        let keys = k.split(':');
        let [space, key] = keys;

        if (keys.length === 1)
            return merge(p, { [k]: typeof c === 'object' ? inflate(<any>c) : c });

        return fuse(p, { [space]: { [key]: typeof c === 'object' ? inflate(<any>c) : c } })

    }, <O>{});

/**
 * extract from a Schema only the part that deals with a specific 
 * processor.
 */
export const extract = <O extends { [key: string]: A }, A>(proc: string, s: Schema<O>): Schema<O> =>
    afpl.util.reduce(s, (p, c, k) =>
        (k[0] !== '@' && c.hasOwnProperty(proc)) ?
            afpl.util.merge(p, { [k]: c[proc] }) : p, {});
/**
 * strip processor directives from the schema.
 */
export const strip = <O extends { [key: string]: A }, A>(s: Schema<O>): Schema<O> =>
    afpl.util.reduce(s, (p, c, k) =>
        (k[0] === '@') ? p : afpl.util.merge(p, { [k]: c }));

/**
 * groupByTable constructs a new schema by grouping columns according
 * to the table specificer.
 */
export const groupByTable = <A>(s: Schema<Column<A>>, main: string) =>
    afpl.util.reduce(s, (p, c, k) => afpl.util.fuse(p, {

        [c.hasOwnProperty('table') ? c.table : main]: { [k]: c }

    }), {});

/**
 * filter provides a list of keys that satisfy a condition.
 */
export const filter = <A>(s: Schema<Column<A>>, fn: (a: Column<A>) => boolean) =>
    Object.keys(s).filter(k => fn(s[k]));

const _output = <A extends object>(o: Options) => (s: Schema<Column<A>>) => {

    let tables = groupByTable(extract('@sql', s), s['@sql']['table']);
    let columns = extract('@sql', strip(s));
    let sql = s['@sql'];
    let keys = Object.keys(extract('@sql', strip(s)));
    let ro = filter(columns, c => c.hasOwnProperty('ro'));

    return render(o.template, {
        sql,
        tables,
        columns,
        keys,
        ro
    }, o);

}

const _defaults = { '@sql': { key: { type: 'INT', name: 'id' } } };

/**
 * execute the program.
 */
export const execute = (opts: Options): Promise<string> =>
    opts.generate ?
        render(opts.file, {}, opts) :
        readJSONFile<Schema<Column<any>>>(opts.file)
            .then(e =>
                e
                    .map(inflate)
                    .map(a => fuse<object, object>(_defaults, a))
                    .cata(Promise.reject, _output(opts)));

export const args2Options = (args: Arguments): Options =>
    ({
        file: args['<file>'],
        template: args['-t'],
        views: args['-v'],
        contextOnly: args['--context-only'],
        generate: args['--generate']
    });

const args = docopt.docopt<Arguments>(`

Usage:
   dasql (-t TEMPLATE -v VIEWS) [options] <file>
   dasql (-v VIEWS --generate) <file>

Options:
  -h --help          Show this screen.
  -t TEMPLATE        Specify the path to a template to use.
  -v VIEWS           Specify the path templates should be looked up from.
  --generate         Only generate a template. Treats <file> as the template.
  --context-only     Prints the context for the templates to STDOUT.
  --version          Show version.
`, {
        version: require('../package.json').version
    });

execute(args2Options(args))
    .then(console.log)
    .catch(console.error);

