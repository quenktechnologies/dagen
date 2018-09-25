import { Load, Create, Loader } from './';
export declare class FileSystemLoader implements Loader {
    cwd: string;
    constructor(cwd: string);
    load: Load;
    create: Create;
}
