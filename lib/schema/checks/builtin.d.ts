import { Value } from '@quenk/noni/lib/data/json';
import { Providers } from './provider';
import { Root, ObjectType, Schema } from '../';
import { Definitions } from '../definitions';
import { Check } from './';
/**
 * providers available for the '$checks' section.
 */
export declare const providers: Providers<Value>;
export declare const defs: Definitions;
export declare const definitions: ObjectType;
/**
 * root is a Data Document Schema root schema
 * described using a Data Document Schema.
 */
export declare const root: Root;
export declare const check: Check<Schema>;
