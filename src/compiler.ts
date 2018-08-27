import * as Promise from 'bluebird';
import { set } from 'property-seek';
import { expand } from './schema/path';
import { normalize } from './schema/path/namespace';
import { Schema } from './schema';

export const PATH_SEPERATOR = '.';

/**
 * Context compilation takes place in.
 *
 * This is different to the context templates are executed in.
 */
export interface Context {

    /**
     * schema for the data model.
     */
  schema: Schema,

    /**
     * ns list used to distinguish which schema properties are in effect.
     */
    ns: string[]

}

/**
 * pathExpansion stage.
 * 
 * Nested property short-hand is expanded to full JSON object representation.
 */
export const pathExpansion = (c: Context): Promise<Context> =>
    Promise.resolve(set('schema', expand(c.schema), c));

/**
 * nameSubstitution sage.
 *
 * During this tage the processing program calculates the effective namespace.
 */
export const namespaceSubstitution = (c:Context) : Promise<Context> => 
  Promise.resolve(set('schema', normalize(c.ns)(c.schema), c));
      
/**
 * compile a JSON document into a valid document schema.
 */
export const compile = (c: Context) => (j: Object) => `${c}${j}`;
