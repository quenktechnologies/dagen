import { Object } from '@quenk/noni/lib/data/json';
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
export interface Plugin extends CompilerPlugin, GeneratorPlugin {

    /**
     * configure the Plugin.
     */
    configure(c: Conf): Future<Conf>

}

/**
 * Conf is expected to be a set of key value pairs
 * where each key is a plugin name and the value it's configuration.
 */
export interface Conf {

    [key: string]: Object

}

/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
export abstract class AbstractPlugin implements Plugin {

    constructor(public context: Context) { }

    abstract name: string;

    configure(c: Conf): Future<Conf> {

        return pure(c);

    }

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

    configure(c: Conf): Future<Conf> {

        if (this.empty()) return pure(c);

        let fs = this.plugins.map(p => (c: Conf) => p.configure(c));
        return (pipeN.apply(undefined, fs))(c);

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
