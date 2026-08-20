import * as args from '../args';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { Future, batch } from '@quenk/noni/lib/control/monad/future';
import { Object } from '@quenk/noni/lib/data/json';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { distribute, empty } from '@quenk/noni/lib/data/array';
import { writeFile } from '@quenk/noni/lib/io/file';

import { Context } from '../../compiler';
import { FileSystemLoader } from '../../schema/loader/file-system';
import { Nunjucks } from '../../compiler/generator/nunjucks';
import { CompositePlugin } from '../../plugin';
import {
    loadSchema,
    loadDefinitions,
    loadChecks,
    setValues,
    loadPlugins
} from '../';
import { Command } from './';
import { evaluate } from '../../schema/path';

export const MAX_WORKLOAD = 50;

/**
 * Args is the normalized form of the command line arguments.
 */
export interface Args {
    schema: string[];

    plugin: string[];

    namespace: string[];

    definition: string[];

    templates: string[];

    template: string;

    set: string[];

    config: string[];

    check: string[];

    ext: string;

    out: string;

    exclude: string[];
}

/**
 * Compile command.
 *
 * This command will compile the schema and generate code output if
 * a template is given.
 */
export class Compile {
    constructor(public argv: Args) {}

    static enqueue(argv: Object): Maybe<Command<void>> {
        return fromNullable(new Compile(extract(argv)));
    }

    run(): Future<void> {
        return Future.do(async () => {
            let { argv } = this;

            let config = await setValues({})(argv.config);

            let defs = await loadDefinitions(argv.definition);

            // The empty string ensures we still output when no schema provided.
            let schemas = empty(argv.schema) ? [''] : argv.schema;

            let results = await batch(
                distribute(
                    schemas.map(file =>
                        Future.do(async (): Promise<string | undefined> => {
                            let ctx = new Context(
                                {},
                                argv.namespace,
                                [],
                                new FileSystemLoader(path.dirname(file))
                            );

                            let plist = await loadPlugins(ctx, argv.plugin);

                            let plugins = new CompositePlugin(plist);

                            plugins.configure(config);

                            let pluginChecks = await plugins.checkSchema();

                            let schema = await loadSchema(file);

                            let checks = await loadChecks(
                                argv.check,
                                pluginChecks
                            );

                            ctx.addDefinitions(defs);

                            ctx.addChecks(checks);

                            ctx.setPlugin(plugins);

                            schema = await setValues(schema)(argv.set);

                            let s: Object = await ctx.compile(schema);

                            if (argv.exclude.some(expr => evaluate(s, expr)))
                                return undefined;

                            let gen = await plugins.configureGenerator(
                                Nunjucks.create(
                                    argv.template,
                                    argv.templates.map(
                                        path =>
                                            new nunjucks.FileSystemLoader(path)
                                    )
                                )
                            );

                            let content = await plugins.onOutput(schema, argv.template
                                ? await gen.render(s)
                                : JSON.stringify(s));

                            if (argv.out) {
                                let filename = path.basename(
                                    file,
                                    path.extname(file)
                                );

                                if (argv.ext)
                                    filename = `${filename}.${argv.ext}`;

                                let dir = path.isAbsolute(argv.out)
                                    ? argv.out
                                    : path.resolve(
                                          path.join(process.cwd(), argv.out)
                                      );

                                await writeFile(
                                    path.join(dir, filename),
                                    content
                                );

                                return undefined;
                            }

                            return content;
                        })
                    ),
                    MAX_WORKLOAD
                )
            );

            // Printing happens here, sequentially, once every file has
            // finished compiling, so that output order always matches the
            // order the schema files were given in regardless of which
            // file's Future settled first.
            for (let content of results.flat())
                if (content !== undefined) console.log(content);
        });
    }
}

/**
 * extract an Args record using a docopt argument map.
 */
export const extract = (argv: Object): Args => ({
    schema: <string[]>argv['<file>'],

    plugin: <string[]>argv[args.ARGS_PLUGIN],

    namespace: <string[]>argv[args.ARGS_NAMESPACE],

    definition: <string[]>argv[args.ARGS_DEFINITIONS],

    templates: <string[]>argv[args.ARGS_TEMPLATES] || [process.cwd()],

    template: <string>argv[args.ARGS_TEMPLATE],

    set: <string[]>argv[args.ARGS_SET],

    check: <string[]>argv[args.ARGS_CHECK],

    config: <string[]>argv[args.ARGS_CONFIG],

    ext: <string>argv[args.ARGS_EXT] || '',

    out: <string>argv[args.ARGS_OUT] || '',

    exclude: <string[]>argv[args.ARGS_EXCLUDE] || []
});
