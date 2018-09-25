import * as Promise from 'bluebird';
import * as nunjucks from 'nunjucks';
import { Object } from '@quenk/noni/lib/data/json';
import { reduce } from '@quenk/noni/lib/data/record';
import { functions, filters } from './builtin';
import { Generator } from '../';

/**
 * Nunjucks output generators.
 */
export class Nunjucks implements Generator<string> {

    constructor(
        public template: string,
        public env: nunjucks.Environment) { }

    static create(template: string, loaders: nunjucks.ILoader): Nunjucks {

        return new Nunjucks(template,
            addFilters(addFunctions(
                new nunjucks.Environment([loaders], {
                    autoescape: false,
                    throwOnUndefined: true,
                    trimBlocks: true,
                    lstripBlocks: true,
                    noCache: true
                }))));

    }

    render(document: Object): Promise<string> {

        return Promise.resolve(this.env.render(this.template, { document }));

    }

}

const addFunctions = (env: nunjucks.Environment): nunjucks.Environment =>
  reduce(functions, env, (p, c: Function, k) => <any>p.addGlobal(k, c));

const addFilters = (env: nunjucks.Environment): nunjucks.Environment =>
  reduce(filters, env, (p, c: any, k) => <any>p.addFilter(k, c));

