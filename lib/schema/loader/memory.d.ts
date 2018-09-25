import { Object } from '@quenk/noni/lib/data/json';
import { Load, Create, Loader } from './';
export declare class MemoryLoader implements Loader {
    cwd: string;
    refs: {
        [key: string]: Object;
    };
    constructor(cwd: string, refs: {
        [key: string]: Object;
    });
    load: Load;
    create: Create;
}
