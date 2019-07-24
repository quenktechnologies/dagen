import * as nunjucks from 'nunjucks';
import { Environment } from 'nunjucks';
import { Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Generator } from '../';
/**
 * Plugin for the nunjucks generate.
 */
export interface Plugin {
    /**
     * configureGenerator is applied to the nunjucks Environment to allow
     * it to be configured before use.
     */
    configureGenerator(env: Nunjucks): Future<Nunjucks>;
}
/**
 * Nunjucks output generators.
 */
export declare class Nunjucks implements Generator<string> {
    template: string;
    env: Environment;
    constructor(template: string, env: Environment);
    static create(template: string, loaders: nunjucks.ILoader): Nunjucks;
    render(document: Object): Future<string>;
}
