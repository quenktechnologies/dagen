"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryLoader = void 0;
const Path = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
class MemoryLoader {
    constructor(cwd, refs) {
        this.cwd = cwd;
        this.refs = refs;
        this.load = (path) => this.refs.hasOwnProperty(path) ?
            (0, future_1.pure)(this.refs[path]) :
            (0, future_1.raise)(new Error(`Bad path "${path}"`));
        this.create = (current) => new MemoryLoader(Path.resolve(this.cwd, current), this.refs);
    }
}
exports.MemoryLoader = MemoryLoader;
//# sourceMappingURL=memory.js.map