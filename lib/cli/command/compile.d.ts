import { Future } from '@quenk/noni/lib/control/monad/future';
import { Object } from '@quenk/noni/lib/data/json';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Command } from './';
/**
 * Args is the normalized form of the command line arguments.
 */
export interface Args {
    schema: string;
    plugin: string[];
    namespace: string[];
    definition: string[];
    templates: string;
    template: string;
    set: string[];
    config: string[];
    check: string[];
}
/**
 * Compile command.
 *
 * This command will compile the schema and generate code output if
 * a template is given.
 */
export declare class Compile {
    argv: Args;
    constructor(argv: Args);
    static enqueue(argv: Object): Maybe<Command<void>>;
    run(): Future<void>;
}
/**
 * extract an Args record using a docopt argument map.
 */
export declare const extract: (argv: Object) => Args;
