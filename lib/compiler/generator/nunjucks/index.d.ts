import * as nunjucks from 'nunjucks';
import { Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Generator } from '../';
/**
 * Nunjucks output generators.
 */
export declare class Nunjucks implements Generator<string> {
    template: string;
    env: nunjucks.Environment;
    constructor(template: string, env: nunjucks.Environment);
    static create(template: string, loaders: nunjucks.ILoader): Nunjucks;
    render(document: Object): Future<string>;
}
