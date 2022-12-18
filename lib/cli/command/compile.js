"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = exports.Compile = exports.MAX_WORKLOAD = void 0;
const args = require("../args");
const nunjucks = require("nunjucks");
const path = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const array_1 = require("@quenk/noni/lib/data/array");
const file_1 = require("@quenk/noni/lib/io/file");
const compiler_1 = require("../../compiler");
const file_system_1 = require("../../schema/loader/file-system");
const nunjucks_1 = require("../../compiler/generator/nunjucks");
const plugin_1 = require("../../plugin");
const __1 = require("../");
const path_1 = require("../../schema/path");
exports.MAX_WORKLOAD = 50;
/**
 * Compile command.
 *
 * This command will compile the schema and generate code output if
 * a template is given.
 */
class Compile {
    constructor(argv) {
        this.argv = argv;
    }
    static enqueue(argv) {
        return (0, maybe_1.fromNullable)(new Compile((0, exports.extract)(argv)));
    }
    run() {
        let { argv } = this;
        return (0, future_1.doFuture)(function* () {
            let config = yield ((0, __1.setValues)({})(argv.config));
            let defs = yield (0, __1.loadDefinitions)(argv.definition);
            // The empty string ensures we still output when no schema provided.
            let schemas = (0, array_1.empty)(argv.schema) ? [''] : argv.schema;
            yield (0, future_1.batch)((0, array_1.distribute)(schemas.map(file => (0, future_1.doFuture)(function* () {
                let ctx = new compiler_1.Context({}, argv.namespace, [], new file_system_1.FileSystemLoader(path.dirname(file)));
                let plist = yield (0, __1.loadPlugins)(ctx, argv.plugin);
                let plugins = new plugin_1.CompositePlugin(plist);
                plugins.configure(config);
                let pluginChecks = yield plugins.checkSchema();
                let schema = yield (0, __1.loadSchema)(file);
                let checks = yield (0, __1.loadChecks)(argv.check, pluginChecks);
                ctx.addDefinitions(defs);
                ctx.addChecks(checks);
                ctx.setPlugin(plugins);
                schema = yield ((0, __1.setValues)(schema)(argv.set));
                let s = yield ctx.compile(schema);
                if (argv.exclude.some(expr => (0, path_1.evaluate)(s, expr)))
                    return future_1.voidPure;
                let gen = yield plugins.configureGenerator(nunjucks_1.Nunjucks
                    .create(argv.template, new nunjucks.FileSystemLoader(argv.templates)));
                let content = argv.template ?
                    yield gen.render(s)
                    : JSON.stringify(s);
                if (argv.out) {
                    let filename = path.basename(file, path.extname(file));
                    if (argv.ext)
                        filename = `${filename}.${argv.ext}`;
                    let dir = path.isAbsolute(argv.out) ? argv.out :
                        require.resolve(path.join(process.cwd(), argv.out));
                    yield (0, file_1.writeFile)(path.join(dir, filename), content);
                }
                else {
                    console.log(content);
                }
                return future_1.voidPure;
            })), exports.MAX_WORKLOAD));
            return future_1.voidPure;
        });
    }
}
exports.Compile = Compile;
/**
 * extract an Args record using a docopt argument map.
 */
const extract = (argv) => ({
    schema: argv['<file>'],
    plugin: argv[args.ARGS_PLUGIN],
    namespace: argv[args.ARGS_NAMESPACE],
    definition: argv[args.ARGS_DEFINITIONS],
    templates: argv[args.ARGS_TEMPLATES] || process.cwd(),
    template: argv[args.ARGS_TEMPLATE],
    set: argv[args.ARGS_SET],
    check: argv[args.ARGS_CHECK],
    config: argv[args.ARGS_CONFIG],
    ext: argv[args.ARGS_EXT] || '',
    out: argv[args.ARGS_OUT] || '',
    exclude: argv[args.ARGS_EXCLUDE] || []
});
exports.extract = extract;
//# sourceMappingURL=compile.js.map