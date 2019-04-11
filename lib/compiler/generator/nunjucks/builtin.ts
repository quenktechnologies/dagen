import * as typ from '@quenk/noni/lib/data/type';
import * as schema from '../../../schema';
import * as json from '@quenk/noni/lib/data/json';
import * as arrays from '@quenk/noni/lib/data/array';
import { get, set } from 'property-seek';
import { Record, merge, rmerge, reduce } from '@quenk/noni/lib/data/record';

/**
 * takeArrays extracts the columns from a list that are array types.
 */
export const takeArrays = (doc: json.Object) => reduce(doc, {},
    (p: json.Object, c, k) => schema.isArrayType(c) ?
        rmerge(p, { [k]: c }) : p);

/**
 *  * takeObjects extracts type='object' columns.
 *   */
export const takeObjects = (doc: json.Object) => reduce(doc, {},
    (p: json.Object, c, k) => schema.isObjectType(c) ?
        rmerge(p, { [k]: c }) : p);

/**
 * takeSums extracts type='sum' columns.
 */
export const takeSums = (doc: json.Object) => reduce(doc, {},
    (p: json.Object, c, k) => schema.isSumType(c) ?
        rmerge(p, { [k]: c }) : p);

//XXX: this will be removed once we plugins
const pathJoin = (l: string, r: string) => [l, r].filter(v => v).join('.');

const mergeVariants = (o: any) =>
    reduce(o.variants, (p: any, c: any) => merge(p, c.properties), <any>{});

/**
 * functions made available for templates.
 */
export const functions: Record<Function> = {

    'isArray': typ.isArray,
    'isObject': typ.isObject,
    'isFunction': typ.isFunction,
    'isNumber': typ.isNumber,
    'isString': typ.isString,
    'isBoolean': typ.isBoolean,
    'isPrim': typ.isPrim,
    'isArrayType': schema.isArrayType,
    'isObjectType': schema.isObjectType,
    'isStringType': schema.isStringType,
    'isNumberType': schema.isNumberType,
    'isBooleanType': schema.isBooleanType,
    'isSumType': schema.isSumType,
    'merge': merge,
    'rmerge': rmerge,
    'get': get,
    'set': set,
    'require': require,
    'takeArrays': takeArrays,
    'takeObjects': takeObjects,
    'takeSums': takeSums,
    'contains': arrays.contains,
    'pathjoin': pathJoin

};

/**
 * filters made available for templates.
 */
export const filters: Record<Function> = {

    'throw': (msg: string) => { throw new Error(msg); },
    'error': console.error,
    'log': console.log,
    'info': console.info,
    'mergevariants': mergeVariants
};
