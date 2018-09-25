import { Value } from '@quenk/noni/lib/data/json';
import { Check } from './';

/**
 * Provider when given any number of arguments produces a Check.
 */
export type Provider<B> = (...value: Value[]) => Check<B>;

/**
 * Providers is a map of functions that provide checks given one
 * or more arguments.
 */
export interface Providers<B> {

    [key: string]: Provider<B>

}
