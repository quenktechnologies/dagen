import * as Promise from 'bluebird';
import * as args from '../args';
import * as nunjucks from 'nunjucks';
import { dirname } from 'path';
import { Object } from '@quenk/noni/lib/data/json';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { Context, compile } from '../../compiler';
import { FileSystemLoader } from '../../schema/loader/file-system';
import { Nunjucks } from '../../compiler/generator/nunjucks';
import { loadSchema, loadDefinitions, loadChecks, loadPlugins } from '../';
import { Command } from './';

export class Compile {

    constructor(public argv: Object) { }

    static enqueue(argv: Object): Maybe<Command<void>> {

        return fromNullable(new Compile(argv));

    }

    run(): Promise<void> {

        let argv = this.argv;
        let file = <string>argv['<file>'];

        return loadSchema(file)
            .then(schema =>
                loadDefinitions(<string[]>argv[args.ARGS_DEFINITIONS])
                    .then(defs =>
                        loadChecks(<string[]>argv[args.ARGS_CHECK])
                            .then(checks =>
                                loadPlugins(<string[]>argv[args.ARGS_PLUGIN])
                                    .then(plugins => new Context(
                                        defs,
                                        <string[]>argv[args.ARGS_NAMESPACE],
                                        checks,
                                        new FileSystemLoader(dirname(file)),
                                        plugins))))
                    .then(ctx => compile(ctx)(schema))
                    .then((s: Object) => hasTemplate(argv) ?
                        Nunjucks
                            .create(template(argv), new nunjucks.FileSystemLoader(cwd(argv)))
                            .render(s) :
                        JSON.stringify(s)))
            .then(console.log);

    }

}

const cwd = (argv: Object) =>
    (<string>argv[args.ARGS_TEMPLATES]) || process.cwd();

const template = (argv: Object) =>
    <string>argv[args.ARGS_TEMPLATE];

const hasTemplate = (argv: Object) => 
  (template(argv) != null);


