import { Value } from '@quenk/noni/lib/data/json';
import { identity, every } from '@quenk/preconditions';
import { Check } from './';

/**
 * Spec describes a desired Check in JSON.
 */
export interface Spec {

    [key: string]: Value

    /**
     * name of the Check.
     */
    name: string,

    /**
     * parameters for the Check.
     */
    parameters?: Value[]

}

/**
 * Providers is a map of functions that provide checks given one
 * or more arguments.
 */
export interface Providers<B> {

    [key: string]: (...value: Value[]) => Check<B>

}

/**
 * specs2Checks converts an array of specs into a Check chain.
 */
export const specs2Checks = <B>(p: Providers<B>) => (specs: Spec[]): Check<B> =>
    (specs.length > 0) ?
        every.apply(null, specs.map(spec2Check(p))) :
        identity;

/**
 * spec2Check converts a Spec to a Check using the spec name.
 *
 * If the name is not found the identity Check is used.
 */
export const spec2Check = <B>(providers: Providers<B>) => (s: Spec): Check<B> =>
    providers.hasOwnProperty(s.name) ?
        providers[s.name].apply(null, Array.isArray(s.parameters) ?
            s.parameters :
            []) :
        identity;
