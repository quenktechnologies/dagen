"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args = require("../args");
const nunjucks = require("nunjucks");
const path_1 = require("path");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const compiler_1 = require("../../compiler");
const file_system_1 = require("../../schema/loader/file-system");
const nunjucks_1 = require("../../compiler/generator/nunjucks");
const __1 = require("../");
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
        let argv = this.argv;
        let file = argv.schema;
        return __1.loadSchema(file)
            .then(schema => __1.loadDefinitions(argv.definition)
            .then(defs => __1.loadChecks(argv.check)
            .then(checks => __1.loadPlugins(argv.plugin)
            .then(plugins => new compiler_1.Context(defs, argv.namespace, checks, new file_system_1.FileSystemLoader(path_1.dirname(file)), plugins))))
            .then(ctx => (__1.setValues(schema)(argv.set))
            .then(schema => compiler_1.compile(ctx)(schema))
            .then((s) => argv.template ?
            nunjucks_1.Nunjucks
                .create(argv.template, new nunjucks.FileSystemLoader(argv.templates))
                .render(s) :
            JSON.stringify(s)))
            .then(console.log));
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