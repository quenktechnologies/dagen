import * as Promise from 'bluebird';
import { Object } from '@quenk/noni/lib/data/json';

export interface Generator<R> {

    render(root: Object): Promise<R>

}
