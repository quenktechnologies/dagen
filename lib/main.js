#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = void 0;
///<reference path='docopt.d.ts'/>
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
          [--set=KVP...] [--config=CONF...] [--template=TEMPLATE]
          [--templates=PATH] [--check=PATH...] [--install-check=PATH] [<file>]

Options:
  -h --help                  Show this screen.
  --template TEMPLATE        Specify the template to use when generating code.
  --templates PATH           Path to resolve templates from. Defaults to process.cwd().
  --namespace EXT            Sets a namespace to be in effect.
  --plugin PATH              Path to a plugin that will be loaded at runtime.
  --definitions PATH         Path to an exported definition object to include.
  --set PATH=VALUE           Set a value on the schema document.
  --config PATH=VALUE        Set a value in the plugin config object.
  --check PATH               Loads and applies a check to the final document.
  --install-check PATH       Make a precondition available to be used as a $check.
  --context PATH             Path to a ES object to merge into the context.
  --version                  Show version.
`, {
    version: require('../package.json').version
});
const onError = (args) => (e) => {
    let file = args['<file>'] || '<void>';
    console.error(`Error occured while processing file "${file}"!`);
    console.error('Dumping CLI configuration:');
    console.error(args);
    console.error(e.stack);
    process.exit(1);
};
compile_1.Compile
    .enqueue(args)
    .get()
    .run()
    .fork(onError(args), () => { });
//# sourceMappingURL=main.js.map