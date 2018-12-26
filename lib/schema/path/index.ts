import * as json from '@quenk/noni/lib/data/json';
import { set } from 'property-seek';
import { match } from '@quenk/noni/lib/control/match';
import { flip, cons } from '@quenk/noni/lib/data/function';
import { map } from '@quenk/noni/lib/data/array';
import { flatten, unescapeRecord } from '@quenk/noni/lib/data/record/path';
import { reduce } from '@quenk/noni/lib/data/record';

export const PATH_SEPARATOR = '.';

/**
 * expand the paths of a JSON value authored in short-form recursively.
 */
export const expand = (val: json.Value): json.Value => <json.Value>match(val)
    .caseOf(Array, expandArray)
    .caseOf(Object, expandObject)
    .orElse(cons(val))
    .end();

export const expandArray = (flip(map)(expand));

export const expandObject = (o: json.Object): json.Object =>
    reduce(unescapeRecord(flatten(o)), {}, (p, c, k) => set(k, c, p));
