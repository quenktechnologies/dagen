import * as json from '@quenk/noni/lib/data/json';
import { Record } from '@quenk/noni/lib/data/record';
/**
 * takeArrays extracts the columns from a list that are array types.
 */
export declare const takeArrays: (doc: json.Object) => {};
/**
 *  * takeObjects extracts type='object' columns.
 *   */
export declare const takeObjects: (doc: json.Object) => {};
/**
 * takeSums extracts type='sum' columns.
 */
export declare const takeSums: (doc: json.Object) => {};
/**
 * functions made available for templates.
 */
export declare const functions: Record<Function>;
/**
 * filters made available for templates.
 */
export declare const filters: Record<Function>;
