#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const docopt = require("docopt");
const util_1 = require("afpl/lib/util");
const _1 = require(".");
const BIN = path.basename(__filename);
const defaultOptions = () => ({
    templates: process.cwd()
});
/**
 * args2Options converts command line options to an Options record.
 */
exports.args2Options = (args) => ({
    file: args['<file>'],
    template: args['--template'] || '',
    contexts: args['--context'],
    templates: args['--templates'] || process.cwd(),
    plugins: args['--plugin'],
    concern: args['--concern'] || ''
});
const args = docopt.docopt(`

Usage:
   ${BIN} [options] [--plugin=PATH...] [--context=PATH...] <file>

Options:
  -h --help                  Show this screen.
  --template TEMPLATE        Specify the template to use when generating code.
  --templates PATH           Path to resolve templates from. Defaults to process.cwd().
  --plugin PATH              Path to a plugin that will be loaded at runtime.
  --context PATH             Path to a javascript object that will be merged into the document's context.
  --concern EXT              Forces the concern to be EXT.
  --version                  Show version.
`, {
    version: require('../package.json').version
});
_1.readDocument(args['<file>'])
    .then(_1.options2Program(util_1.fuse(exports.args2Options(args), defaultOptions())))
    .then(_1.execute)
    .then(console.log)
    .catch(e => console.error(e.stack));
//# sourceMappingURL=cli.js.map