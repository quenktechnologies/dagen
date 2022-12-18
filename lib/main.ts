#! /usr/bin/env node
///<reference path='docopt.d.ts'/>
import * as path from 'path';
import * as docopt from 'docopt';
import { Object } from '@quenk/noni/lib/data/json';
import { Compile } from './cli/command/compile';

const BIN = path.basename(__filename);

export const defaultOptions = () => ({

    templates: process.cwd()

});

const args = docopt.docopt(`

Usage:
   ${BIN} [--namespace=NAMESPACE...] [--plugin=PATH...] [--definitions=PATH...]
          [--set=KVP...] [--config=CONF...] [--template=TEMPLATE]
          [--templates=PATH] [--check=PATH...] [--install-check=PATH] 
          [--context PATH...] [--out PATH] [--ext EXT] [--exclude=EXPR...] [<file>...]

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
  --context PATH             Path to an object to merge into the context.
  --out PATH                 Path to write output to. If not specified output is
                             written to STDOUT.
  --ext EXT                  Extension to use when writing output file. Defaults
                             to none.
  --exclude EXPR             A path expression to evaluate against each schema
                             to determine whether to exclude it or not.
  --version                  Show version.
`, {
    version: require('../package.json').version
});

const onError = (args: Object) => (e: Error) => {

    let file = args['<file>'] || '<void>';

    console.error(`Error occured while processing file "${file}"!`);

    console.error('Dumping CLI configuration:');

    console.error(args);

    console.error(e.stack);

    process.exit(1);

}

Compile
    .enqueue(<Object>args)
    .get()
    .run()
    .fork(onError(<Object>args), () => { });
