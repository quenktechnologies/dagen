import { Type, isFunction } from '@quenk/noni/lib/data/type';
import { Object } from '@quenk/noni/lib/data/json';
import { Future, pure, parallel } from '@quenk/noni/lib/control/monad/future';
import { pipeN as pn } from '@quenk/noni/lib/control/monad';
import {
    Plugin as GeneratorPlugin,
    Nunjucks
} from '../compiler/generator/nunjucks';
import { Context, Plugin as CompilerPlugin } from '../compiler';
import { Schema } from '../schema';

const pipeN: Type = pn;

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
     * configure the plugin's Conf object.
     */
    configure(c: Conf): Future<Conf>;

    /**
     * checkSchema allows a plugin to add check schema to the list
     * of schema that is applied to the the document.
     */
    checkSchema(): Future<Schema[]>;

    /**
     * onOutput is called before the final output of the generated code.
     */
    onOutput(s: Schema, output: string): Promise<string>;
}

/**
 * Conf is expected to be a set of key value pairs
 * where each key is a plugin name and the value it's configuration.
 */
export interface Conf {
    [key: string]: Object;
}

/**
 * AbstractPlugin can be extended to partially implement a plugin.
 */
export abstract class AbstractPlugin implements Plugin {
    constructor(public context: Context) {}

    abstract name: string;

    configure(c: Conf): Future<Conf> {
        return pure(c);
    }

    checkSchema(): Future<Schema[]> {
        return pure([]);
    }

    configureGenerator(gen: Nunjucks): Future<Nunjucks> {
        return pure(gen);
    }

    beforeOutput(s: Schema): Future<Schema> {
        return pure(s);
    }

    async onOutput(_: Schema, output: string): Promise<string> {
        return output;
    }
}

/**
 * CompositePlugin combines mulitple plugins into one.
 */
export class CompositePlugin implements Plugin {
    constructor(public plugins: Plugin[]) {}

    /**
     * @private
     */
    empty(): boolean {
        return this.plugins.length === 0;
    }

    configure(c: Conf): Future<Conf> {
        if (this.empty()) return pure(c);

        let fs = this.plugins.map(p => (c: Conf) => p.configure(c));
        return pipeN.apply(undefined, fs)(c);
    }

    checkSchema(): Future<Schema[]> {
        return parallel(this.plugins.map(p => p.checkSchema())).map(list =>
            list.reduce((p, c) => p.concat(c), [])
        );
    }

    configureGenerator(gen: Nunjucks): Future<Nunjucks> {
        if (this.empty()) return pure(gen);

        let fs = this.plugins.map(
            p => (g: Nunjucks) => p.configureGenerator(g)
        );
        return pipeN.apply(undefined, fs)(gen);
    }

    beforeOutput(s: Schema): Future<Schema> {
        if (this.empty()) return pure(s);

        let fs = this.plugins.map(p => (s: Schema) => p.beforeOutput(s));
        return pipeN.apply(undefined, fs)(s);
    }

    async onOutput(s: Schema, output: string): Promise<string> {
        let finalOutput = output;
        for (let plugin of this.plugins) {
            if (isFunction(plugin.onOutput))
                finalOutput = await plugin.onOutput(s, finalOutput);
        }
        return finalOutput;
    }
}
