import { Object } from '@quenk/noni/lib/data/json';
import { Future } from '@quenk/noni/lib/control/monad/future';
export interface Generator<R> {
    render(root: Object): Future<R>;
}
