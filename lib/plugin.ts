import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { pipeN } from '@quenk/noni/lib/control/monad';
import {
    Plugin as GeneratorPlugin,
    Nunjucks
} from './compiler/generator/nunjucks';
import { Context, Plugin as CompilerPlugin } from './compiler';
import { Schema } from './schema';

/**
 * PluginProvider type.
 */
export type PluginProvider = (c: Context) => Plugin;

/**
 * Plugin allows various stages of data generation to be intercepted and
 * modified before final output.
 */
export interface Plugin extends CompilerPlugin, GeneratorPlugin { }

/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
export class AbstractPlugin implements Plugin {

    constructor(public context: Context) { }

    beforeOutput(s: Schema): Future<Schema> {

        return pure(s);

    }

    configureGenerator(gen: Nunjucks): Future<Nunjucks> {

        return pure(gen);

    }

}

/**
 * CompositePlugin combines mulitple plugins into one.
 */
export class CompositePlugin implements Plugin {

    constructor(public plugins: Plugin[]) { }

    /**
     * @private
     */
    empty(): boolean {

        return (this.plugins.length === 0);

    }

    beforeOutput(s: Schema): Future<Schema> {

        if (this.empty()) return pure(s);

        let fs = this.plugins.map(p => (s: Schema) => p.beforeOutput(s));
        return (pipeN.apply(undefined, fs))(s);

    }

    configureGenerator(gen: Nunjucks): Future<Nunjucks> {

        if (this.empty()) return pure(gen);

        let fs = this.plugins.map(p => (g: Nunjucks) => p.configureGenerator(g));
        return (pipeN.apply(undefined, fs))(gen);

    }

}
