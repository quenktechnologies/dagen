import * as json from '@quenk/noni/lib/data/json';
export declare const PATH_SEPARATOR = ".";
/**
 * expand the paths of a JSON value authored in short-form recursively.
 */
export declare const expand: (val: json.Value) => json.Value;
export declare const expandArray: (a: {}) => {}[];
export declare const expandObject: (o: json.Object) => json.Object;
