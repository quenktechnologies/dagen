import * as Promise from 'bluebird';
import * as Path from 'path';
import { Object } from '@quenk/noni/lib/data/json';
import { Load, Create, Loader } from './';

export class MemoryLoader implements Loader {

    constructor(public cwd: string, public refs: { [key: string]: Object }) { }

    load: Load = (path: string) => this.refs.hasOwnProperty(path) ?
    Promise.resolve(this.refs[path]) : Promise.reject(new Error(`Bad path "${path}"`));

    create: Create = (current: string) =>
        new MemoryLoader(Path.resolve(this.cwd, current), this.refs);

}
