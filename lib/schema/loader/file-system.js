"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const Path = require("path");
const F = require("fs");
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
    .then(d => Promise.try(() => JSON.parse(d)));
const readFile = (path) => Promise
    .fromCallback(done => F.readFile(path, { encoding: 'utf8' }, done));
//# sourceMappingURL=file-system.js.map