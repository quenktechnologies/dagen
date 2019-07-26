import * as args from '../args';
import * as nunjucks from 'nunjucks';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { dirname } from 'path';
import { Object } from '@quenk/noni/lib/data/json';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../compiler';
import { FileSystemLoader } from '../../schema/loader/file-system';
import { Nunjucks } from '../../compiler/generator/nunjucks';
import {
    loadSchema,
    loadDefinitions,
    loadChecks,
    setValues,
    loadPlugins
} from '../';
import { Command } from './';
import { doN, DoFn } from '@quenk/noni/lib/control/monad';
import { CompositePlugin } from '../../plugin';

/**
 * Args is the normalized form of the command line arguments.
 */
export interface Args {

    schema: string,

    plugin: string[],

    namespace: string[],

    definition: string[],

    templates: string,

    template: string,

    set: string[],

    config: string[],

    check: string[]

}

/**
 * Compile command.
 *
 * This command will compile the schema and generate code output if
 * a template is given.
 */
export class Compile {

    constructor(public argv: Args) { }

    static enqueue(argv: Object): Maybe<Command<void>> {

        return fromNullable(new Compile(extract(argv)));

    }

    run(): Future<void> {

        let that = this;

        return doN(<DoFn<void, Future<void>>>function*() {

            let argv = that.argv;

            let file = argv.schema;

            let schema = yield loadSchema(file);

            let defs = yield loadDefinitions(argv.definition);

            let checks = yield loadChecks(argv.check);

            let ctx = new Context(
                defs,
                argv.namespace,
                checks,
                new FileSystemLoader(dirname(file)));

            let plist = yield loadPlugins(ctx, argv.plugin);

            let plugins = new CompositePlugin(plist);

            let config = yield (setValues({})(argv.config));

            plugins.configure(config);

            ctx.setPlugin(plugins);

            schema = yield (setValues(schema)(argv.set));

            let s: Object = yield ctx.compile(schema);

            let gen = yield plugins.configureGenerator(Nunjucks
                .create(argv.template,
                    new nunjucks.FileSystemLoader(argv.templates)));

            let out = yield argv.template ? gen.render(s) :
                pure(JSON.stringify(s));

            console.log(out);

            return pure(undefined);

        });

    }

}

/**
 * extract an Args record using a docopt argument map.
 */
export const extract = (argv: Object): Args => ({

    schema: <string>argv['<file>'],

    plugin: <string[]>argv[args.ARGS_PLUGIN],

    namespace: <string[]>argv[args.ARGS_NAMESPACE],

    definition: <string[]>argv[args.ARGS_DEFINITIONS],

    templates: <string>argv[args.ARGS_TEMPLATES] || process.cwd(),

    template: <string>argv[args.ARGS_TEMPLATE],

    set: <string[]>argv[args.ARGS_SET],

    check: <string[]>argv[args.ARGS_CHECK],

    config: <string[]>argv[args.ARGS_CONFIG],

});
