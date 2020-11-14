import { Value } from '@quenk/noni/lib/data/json';
import { Providers } from './provider';
import { Check } from './';
/**
 * Spec describes a desired Check in JSON.
 */
export interface Spec {
    [key: string]: Value;
    /**
     * name of the Check.
     */
    name: string;
    /**
     * parameters for the Check.
     */
    parameters?: Value[];
}
/**
 * specs2Checks converts an array of specs into a Check chain.
 */
export declare const specs2Checks: <T>(p: Providers<T>) => (specs: Spec[]) => import("@quenk/preconditions").Precondition<Value, T>;
/**
 * spec2Check converts a Spec to a Check using the spec name.
 *
 * If the name is not found the identity Check is used.
 */
export declare const spec2Check: <T>(providers: Providers<T>) => (s: Spec) => import("@quenk/preconditions").Precondition<Value, T>;
