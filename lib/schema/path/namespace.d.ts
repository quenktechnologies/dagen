import { Object } from '@quenk/noni/lib/data/json';
export declare const NAMESPACE_SEPARATOR = ":";
/**
 * isNamespaced indicates whether a string contains the NAMESPACE_SEPARATOR.
 */
export declare const isNamespaced: (p: string) => boolean;
/**
 * normalize the use of namespaces in candidate schema using a list of
 * approved namespaces.
 */
export declare const normalize: (namespaces: string[]) => (o: Object) => Object;
