import { match } from '@quenk/noni/lib/control/match';
import { isRecord, merge, reduce } from '@quenk/noni/lib/data/record';
import { succeed, fail } from '@quenk/preconditions/lib/result';
import { map as pmap } from '@quenk/preconditions/lib/record';
import { Result } from '@quenk/preconditions/lib/result';
import {
    Schema,
    Schemas,
    ObjectType,
    ArrayType,
    SumType,
    TYPE_OBJECT,
    TYPE_ARRAY,
    TYPE_SUM
} from '../';
import { Definition, Definitions } from './';

export const SYMBOL = '#';

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

    [key: string]: Usage

}

/**
 * isRef indicates whether a schema is a reference or not.
 */
export const isRef =
    (s: Schema) =>
        isRecord(s) &&
        (typeof s['type'] === 'string') &&
        (s['type'][0] === SYMBOL);

/**
 * evalUsage evaluates a string against a definition.
 *
 * If the string cannot be resolved to a defintion it results in a Failure.
 */
export const evalUsage =
    (definitions: Definitions) => (def: Usage): Result<Usage, Definition> =>
        definitions.hasOwnProperty(def) ?
            succeed(definitions[def]) :
            fail('unknown', def, { definitions });

/**
 * evalUsages transforms a Usages into a Definitions.
 *
 * If any of the members of the Usages map refer to an 
 * unknown definition the whole evaluation fails.
 */
export const evalUsages =
    (defs: Definitions) => (work: Usages): Result<Usages, Definitions> =>
        <Result<Usages, Schemas>>pmap(evalUsage(defs))(work);

/**
 * pull extracts all the supported usages of definition references in
 * a Schema into a map.
 *
 * The key is the path extracted and the value is the definition name
 * name as it appears in the definitions section.
 */
export const pull =
    (work: Usages) => (path: string) => (schema: Schema): Usages =>
        <Usages>match(schema)
            .caseOf({ type: TYPE_OBJECT }, pullObject(work)(path))
            .caseOf({ type: TYPE_ARRAY }, pullArray(work)(path))
            .caseOf({ type: TYPE_SUM }, pullSum(work)(path))
            .orElse(pullOther(work)(path))
            .end();

const pullObject =
    (work: Usages) => (path: string) => (schema: ObjectType) => {

        let props = isRecord(schema.properties) ?
            pullProperties(work)(path)(schema.properties) : {};

        let adds = hasPullableAdditionalRefs(schema) ?
            pullAdditional(work)(path)(schema.additionalProperties) : {}

        return merge(work, merge(props, adds));

    }

const pullProperties =
    (work: Usages) => (path: string) => (properties: Schemas) =>
        reduce(properties, work, (p, c: Schema, k) =>
            pull(p)(join(path, 'properties', k))(c));

const pullAdditional =
    (work: Usages) => (path: string) => (additional: ObjectType) =>
        merge(work, { [join(path, 'additionalProperties')]: snip(additional) });

const hasPullableAdditionalRefs = (schema: ObjectType) =>
    (isRecord(schema.additionalProperties) &&
        isRef(schema.additionalProperties));

const pullArray =
    (work: Usages) => (path: string) => (schema: ArrayType) =>
        isRef(schema.items) ?
            merge(work, { [join(path, 'items')]: snip(schema.items) }) :
            work;

const pullSum =
    (work: Usages) => (path: string) => (schema: SumType) =>
        reduce(schema.variants, work, (p, c: Schema, k) =>
            pull(p)(join(path, 'variants', k))(c));

const pullOther =
    (work: Usages) => (path: string) => (schema: Schema) =>
        isRef(schema) ? merge(work, { [path]: snip(schema) }) : work;

const snip = (schema: Schema) => schema.type.slice(1);

const join = (...k: string[]) => k.filter(x => x).join('.');
