import { Object, Value } from '@quenk/noni/lib/data/json';
import { set } from 'property-seek';
import {
    Record,
    flatten,
    partition,
    reduce,
    group,
    map,
    merge
} from '@quenk/noni/lib/data/record';
import { tail } from '@quenk/noni/lib/data/array';
import { PATH_SEPARATOR } from './';

export const NAMESPACE_SEPARATOR = ':';

/**
 * isNamespaced indicates whether a string contains the NAMESPACE_SEPARATOR.
 */
export const isNamespaced = (p: string) => (p.indexOf(NAMESPACE_SEPARATOR) > -1);

/**
 * normalize the use of namespaces in candidate schema using a list of 
 * approved namespaces.
 */
export const normalize = (namespaces: string[]) => (o: Object): Object => {

    let [ns, reg] = divide(o);
    let ret: Object = explode({})(<Object>reg);
    let nsGrouped = erase(<Record<Object>>groupByNamespace(<Object>ns));

    return namespaces.reduce((p, c) =>
        nsGrouped.hasOwnProperty(c) ?
            explode(p)(<Object>nsGrouped[c]) :
            p, ret);

}

const divide = (o: Object) =>
    (partition(flatten(o))((_, k: string) => isNamespaced(k)))

const explode = (init: Object) => (o: Object) =>
    reduce(o, init, (p: Object, c, k: string) => set(k, c, p));

const groupByNamespace = (o: Object) =>
    group(o)((_: Value, key: string) =>
        tail(key.split(NAMESPACE_SEPARATOR)[0].split(PATH_SEPARATOR)));

const erase = (nsGrouped: Record<Object>): Object =>
    map(nsGrouped, (o: Object, group: string) =>
        reduce(o, {}, (p, c, k) =>
            merge(p, { [k.replace(`${group}${NAMESPACE_SEPARATOR}`, '')]: c })));
