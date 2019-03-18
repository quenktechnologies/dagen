import { Object, Value } from '@quenk/noni/lib/data/json';
import {
    Record,
    partition,
    reduce,
    group,
    map,
    rmerge,
    merge
} from '@quenk/noni/lib/data/record';
import { flatten, unflatten } from '@quenk/noni/lib/data/record/path';
import { tail } from '@quenk/noni/lib/data/array';
import { PATH_SEPARATOR } from './';

export const NAMESPACE_SEPARATOR = ':';

/**
 * Namespace type.
 */
export type Namespace = string;

/**
 * isNamespaced indicates whether a string contains the NAMESPACE_SEPARATOR.
 */
export const isNamespaced = (p: string) => (p.indexOf(NAMESPACE_SEPARATOR) > -1);

/**
 * normalize the use of namespaces in candidate schema using a list of 
 * approved namespaces.
 */
export const normalize = (namespaces: Namespace[]) => (o: Object): Object => {

    let [ns, nns] = divideByNamespaced(o);
    let ret: Object = inflate({})(<Object>nns);
    let nsGrouped = erase(<Record<Object>>groupByNamespace(<Object>ns));

    return namespaces.reduce((p, c) =>
        nsGrouped.hasOwnProperty(c) ?
            inflate(p)(<Object>nsGrouped[c]) :
            p, ret);

}

const divideByNamespaced = (o: Object) =>
    partition(flatten(o), (_, k: string) => isNamespaced(k));

const inflate = (init: Object) => (o: Object) =>
    rmerge(init, unflatten(o));

const groupByNamespace = (o: Object) =>
    group(o, (_: Value, key: string) =>
        tail(key.split(NAMESPACE_SEPARATOR)[0].split(PATH_SEPARATOR)));

const erase = (nsGrouped: Record<Object>): Object =>
    map(nsGrouped, (o: Object, group: string) =>
        reduce(o, {}, (p, c, k) =>
            merge(p, { [k.replace(`${group}${NAMESPACE_SEPARATOR}`, '')]: c })));
