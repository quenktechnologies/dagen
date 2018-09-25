import * as Promise from 'bluebird';
import * as nunjucks from 'nunjucks';
import { Object } from '@quenk/noni/lib/data/json';
import { Generator } from '../';
/**
 * Nunjucks output generators.
 */
export declare class Nunjucks implements Generator<string> {
    template: string;
    env: nunjucks.Environment;
    constructor(template: string, env: nunjucks.Environment);
    static create(template: string, loaders: nunjucks.ILoader): Nunjucks;
    render(document: Object): Promise<string>;
}
