import {  Value } from '@quenk/noni/lib/data/json';
import { identity, every } from '@quenk/preconditions';

import { Providers } from './provider';
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
 * specs2Checks converts an array of specs into a Check chain.
 */
export const specs2Checks = <T>(p: Providers<T>) => (specs: Spec[]): Check<T> =>
    (specs.length > 0) ?
        every.apply(null, specs.map(spec2Check(p))) :
        identity;

/**
 * spec2Check converts a Spec to a Check using the spec name.
 *
 * If the name is not found the identity Check is used.
 */
export const spec2Check = <T>(providers: Providers<T>) => (s: Spec): Check<T> =>
    providers.hasOwnProperty(s.name) ?
        providers[s.name].apply(null, Array.isArray(s.parameters) ?
            s.parameters :
            []) :
        identity;
