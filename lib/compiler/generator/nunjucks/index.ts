import * as nunjucks from 'nunjucks';
import { Environment } from 'nunjucks';
import { Object } from '@quenk/noni/lib/data/json';
import { Future, fromCallback } from '@quenk/noni/lib/control/monad/future';
import { reduce } from '@quenk/noni/lib/data/record';
import { functions, filters } from './builtin';
import { Generator } from '../';

/**
 * Plugin for the nunjucks generate.
 */
export interface Plugin {

    /**
     * configureGenerator is applied to the nunjucks Environment to allow 
     * it to be configured before use.
     */
    configureGenerator(env: Nunjucks): Future<Nunjucks>

}

/**
 * Nunjucks output generators.
 */
export class Nunjucks implements Generator<string> {

    constructor(
        public template: string,
        public env: Environment) { }

    static create(template: string, loaders: nunjucks.ILoader[]): Nunjucks {

        return new Nunjucks(template,
            addFilters(addFunctions(
                new Environment(loaders, {
                    autoescape: false,
                    throwOnUndefined: true,
                    trimBlocks: true,
                    lstripBlocks: true,
                    noCache: true
                }))));

    }

    render(document: Object): Future<string> {

        return fromCallback(cb => (this.env.render(this.template, { document }, cb)));

    }

}

const addFunctions = (env: nunjucks.Environment): nunjucks.Environment =>
    reduce(functions, env, (p, c: Function, k) => <any>p.addGlobal(k, c));

const addFilters = (env: nunjucks.Environment): nunjucks.Environment =>
    reduce(filters, env, (p, c: any, k) => <any>p.addFilter(k, c));
