import { Future } from '@quenk/noni/lib/control/monad/future';
import { Plugin as GeneratorPlugin, Nunjucks } from './compiler/generator/nunjucks';
import { Context, Plugin as CompilerPlugin } from './compiler';
import { Schema } from './schema';
/**
 * PluginProvider type.
 */
export declare type PluginProvider = (c: Context) => Plugin;
/**
 * Plugin allows various stages of data generation to be intercepted and
 * modified before final output.
 */
export interface Plugin extends CompilerPlugin, GeneratorPlugin {
}
/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
export declare class AbstractPlugin implements Plugin {
    context: Context;
    constructor(context: Context);
    beforeOutput(s: Schema): Future<Schema>;
    configureGenerator(gen: Nunjucks): Future<Nunjucks>;
}
/**
 * CompositePlugin combines mulitple plugins into one.
 */
export declare class CompositePlugin implements Plugin {
    plugins: Plugin[];
    constructor(plugins: Plugin[]);
    /**
     * @private
     */
    empty(): boolean;
    beforeOutput(s: Schema): Future<Schema>;
    configureGenerator(gen: Nunjucks): Future<Nunjucks>;
}
