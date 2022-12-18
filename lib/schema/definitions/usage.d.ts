import { Result } from '@quenk/preconditions/lib/result';
import { Schema } from '../';
import { Definition, Definitions } from './';
export declare const SYMBOL = "#";
/**
 * Ref is a schema whose type value is prefixed by the [[SYMBOL]].
 */
export type Ref = Schema;
/**
 * Usage of a definition refernece.
 */
export type Usage = string;
/**
 * Usages is a map of paths to desired references.
 */
export interface Usages {
    [key: string]: Usage;
}
/**
 * isRef indicates whether a schema is a reference or not.
 */
export declare const isRef: (s: Schema) => boolean;
/**
 * evalUsage evaluates a string against a definition.
 *
 * If the string cannot be resolved to a defintion it results in a Failure.
 */
export declare const evalUsage: (definitions: Definitions) => (def: Usage) => Result<Usage, Definition>;
/**
 * evalUsages transforms a Usages into a Definitions.
 *
 * If any of the members of the Usages map refer to an
 * unknown definition the whole evaluation fails.
 */
export declare const evalUsages: (defs: Definitions) => (work: Usages) => Result<Usages, Definitions>;
/**
 * pull extracts all the supported usages of definition references in
 * a Schema into a map.
 *
 * The key is the path extracted and the value is the definition name
 * name as it appears in the definitions section.
 */
export declare const pull: (work: Usages) => (path: string) => (schema: Schema) => Usages;
