"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemLoader = void 0;
const Path = require("path");
const F = require("fs");
const future_1 = require("@quenk/noni/lib/control/monad/future");
class FileSystemLoader {
    constructor(cwd) {
        this.cwd = cwd;
        this.load = (path) => (path[0] === '.') ?
            readJSON(Path.resolve(this.cwd, path)) :
            readJSON(path);
        this.create = (current) => new FileSystemLoader(Path.isAbsolute(current) ?
            Path.dirname(current) :
            Path.resolve(this.cwd, Path.dirname(current)));
    }
}
exports.FileSystemLoader = FileSystemLoader;
const readJSON = (path) => readFile(path)
    .chain(d => (0, future_1.attempt)(() => JSON.parse(d)));
const readFile = (path) => (0, future_1.fromCallback)(done => F.readFile(path, { encoding: 'utf8' }, done));
//# sourceMappingURL=file-system.js.map