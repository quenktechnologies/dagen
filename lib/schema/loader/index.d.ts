import { Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Namespace } from '../path/namespace';
export declare const REF_SYMBOL = "$ref";
/**
 * Load function.
 */
export declare type Load = (path: string) => Future<Object>;
/**
 * Create function.
 */
export declare type Create = (path: string) => Loader;
/**
 * Loader is the type of function used to load a JSON object fragment
 * into memory.
 */
export interface Loader {
    /**
     * load an object fragment into memory using the specified path.
     */
    load: Load;
    /**
     * create a new Loader instance.
     *
     * The path specified will be used to calculate a new effective
     * path for the new Loader to use as its CWD.
     */
    create: Create;
}
/**
 * Loader is the type of function used to load a JSON object fragment
 * into memory.
 */
export interface Loader {
    /**
     * load an object fragment into memory using the specified path.
     */
    load: (path: string) => Future<Object>;
    /**
     * create a new Loader instance that will operate relative to the
     * cwd specified.
     */
    create: (cwd: string) => Loader;
}
/**
 * resolve references in a schema recursively.
 *
 * This function does the job of the following compilation stages recursively:
 * 1. Path expansion.
 * 2. Namespace resolution.
 * 3. Fragment resolution.
 */
export declare const resolve: (f: Loader, nss: Namespace[]) => (o: Object) => Future<Object>;
