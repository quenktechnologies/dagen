import * as Promise from 'bluebird';
import * as Path from 'path';
import * as F from 'fs';
import { Object } from '@quenk/noni/lib/data/json';
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
      //       (current[0] === '.') ?
      //    Path.resolve(this.cwd, current) :
      //    current);

}

const readJSON = (path: string): Promise<Object> =>
    readFile(path)
        .then(d => Promise.try(() => JSON.parse(d)));

const readFile = (path: string): Promise<string> =>
    Promise
        .fromCallback(done => F.readFile(path, { encoding: 'utf8' }, done));
