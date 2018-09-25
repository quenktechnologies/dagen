#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const docopt = require("docopt");
const compile_1 = require("./cli/command/compile");
const BIN = path.basename(__filename);
exports.defaultOptions = () => ({
    templates: process.cwd()
});
const args = docopt.docopt(`

Usage:
   ${BIN} [--namespace=NAMESPACE...] [--plugin=PATH...] [--definitions=PATH...]
          [--set=KVP...] [--template=TEMPLATE] [--templates=PATH]
          [--check=PATH...] [--install-check=PATH] <file>

Options:
  -h --help                  Show this screen.
  --template TEMPLATE        Specify the template to use when generating code.
  --templates PATH           Path to resolve templates from. Defaults to process.cwd().
  --namespace EXT            Sets a namespace to be in effect.
  --plugin PATH              Path to a plugin that will be loaded at runtime.
  --definitions PATH         Path to an exported definition object to include.
  --set PATH=VALUE           Set a value on the schema document.                      
  --check PATH               Loads and applies a check to the final document. 
  --install-check PATH       Make a precondition available to be used as a $check.
  --context PATH             Path to a ES object to merge into the context.
  --version                  Show version.
`, {
    version: require('../package.json').version
});
compile_1.Compile
    .enqueue(args)
    .get()
    .run()
    .catch(e => { console.error(e); process.exit(-1); });
//# sourceMappingURL=main.js.map