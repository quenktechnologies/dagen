import { Future } from '@quenk/noni/lib/control/monad/future';
/**
 * Command
 */
export interface Command<R> {
    run(): Future<R>;
}
