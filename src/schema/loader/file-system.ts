import * as Path from 'path';
import * as F from 'fs';
import { Object } from '@quenk/noni/lib/data/json';
import {Future, fromCallback, attempt} from '@quenk/noni/lib/control/monad/future';
import { Load, Create, Loader } from './';

export class FileSystemLoader implements Loader {

    constructor(public cwd: string) { }

    load: Load = (path: string) =>
        (path[0] === '.') ?
            readJSON(Path.resolve(this.cwd, path)) :
            readJSON(path);

    create: Create = (current: string) => new FileSystemLoader(
      Path.isAbsolute(current) ?
          Path.dirname(current) :
          Path.resolve(this.cwd, Path.dirname(current)));

}

const readJSON = (path: string): Future<Object> =>
    readFile(path)
        .chain(d => attempt(() => JSON.parse(d)));

const readFile = (path: string): Future<string> =>
        fromCallback(done => F.readFile(path, { encoding: 'utf8' }, done));
