import * as json from '@quenk/noni/lib/data/json';
export declare const PATH_SEPARATOR = ".";
/**
 * expand the paths of a JSON value authored in short-form recursively.
 */
export declare const expand: (val: json.Value) => json.Value;
export declare const expandArray: (a: json.Value[]) => json.Value[];
export declare const expandObject: (o: json.Object) => json.Object;
/**
 * evaluate whether the provided path expression is true.
 *
 * In the future this may evolve into a tiny DSL but for now it just
 * checks a path to see if it is truthy.
 */
export declare const evaluate: (doc: json.Object, expr: string) => boolean;
