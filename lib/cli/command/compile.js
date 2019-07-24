"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args = require("../args");
const nunjucks = require("nunjucks");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const path_1 = require("path");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const compiler_1 = require("../../compiler");
const file_system_1 = require("../../schema/loader/file-system");
const nunjucks_1 = require("../../compiler/generator/nunjucks");
const __1 = require("../");
const monad_1 = require("@quenk/noni/lib/control/monad");
const plugin_1 = require("../../plugin");
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
        return maybe_1.fromNullable(new Compile(exports.extract(argv)));
    }
    run() {
        let that = this;
        return monad_1.doN(function* () {
            let argv = that.argv;
            let file = argv.schema;
            let schema = yield __1.loadSchema(file);
            let defs = yield __1.loadDefinitions(argv.definition);
            let checks = yield __1.loadChecks(argv.check);
            let ctx = new compiler_1.Context(defs, argv.namespace, checks, new file_system_1.FileSystemLoader(path_1.dirname(file)));
            let plist = yield __1.loadPlugins(ctx, argv.plugin);
            let plugins = new plugin_1.CompositePlugin(plist);
            ctx.setPlugin(plugins);
            schema = yield (__1.setValues(schema)(argv.set));
            let s = yield ctx.compile(schema);
            let gen = yield plugins.configureGenerator(nunjucks_1.Nunjucks
                .create(argv.template, new nunjucks.FileSystemLoader(argv.templates)));
            let out = yield argv.template ? gen.render(s) :
                future_1.pure(JSON.stringify(s));
            console.log(out);
            return future_1.pure(undefined);
        });
    }
}
exports.Compile = Compile;
/**
 * extract an Args record using a docopt argument map.
 */
exports.extract = (argv) => ({
    schema: argv['<file>'],
    plugin: argv[args.ARGS_PLUGIN],
    namespace: argv[args.ARGS_NAMESPACE],
    definition: argv[args.ARGS_DEFINITIONS],
    templates: argv[args.ARGS_TEMPLATES] || process.cwd(),
    template: argv[args.ARGS_TEMPLATE],
    set: argv[args.ARGS_SET],
    check: argv[args.ARGS_CHECK]
});
//# sourceMappingURL=compile.js.map