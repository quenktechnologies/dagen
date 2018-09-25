"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const Path = require("path");
class MemoryLoader {
    constructor(cwd, refs) {
        this.cwd = cwd;
        this.refs = refs;
        this.load = (path) => this.refs.hasOwnProperty(path) ?
            Promise.resolve(this.refs[path]) : Promise.reject(new Error(`Bad path "${path}"`));
        this.create = (current) => new MemoryLoader(Path.resolve(this.cwd, current), this.refs);
    }
}
exports.MemoryLoader = MemoryLoader;
//# sourceMappingURL=memory.js.map