"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const util_1 = require("afpl/lib/util");
const resolve = Promise.resolve;
/**
 * ProcedureExtension is a nunjucks extension for writing
 * sql procedures without all the noise.
 */
class ProcedureExtension {
    constructor() {
        this.tags = ['procedure'];
    }
    parse(parser, nodes, _lexer) {
        // get the tag token
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endprocedure');
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtension(this, 'run', args, [body]);
    }
    run(_context, name, params, body) {
        if (arguments.length != 4)
            throw new TypeError('Procedure: Missing procedure name or body!');
        name = `\`${name}\``.toUpperCase();
        return `DROP PROCEDURE IF EXISTS ${name};\n` +
            `SHOW WARNINGS;\n` +
            `CREATE PROCEDURE ${name}${params}\n` +
            `BEGIN\n` +
            `${body()}\n` +
            `END;\n`;
    }
}
exports.ProcedureExtension = ProcedureExtension;
class FunctionExtension {
    constructor() {
        this.tags = ['function'];
    }
    parse(parser, nodes, _lexer) {
        // get the tag token
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endfunction');
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtension(this, 'run', args, [body]);
    }
    run(_context, name, params, returns, body) {
        if (arguments.length != 5)
            throw new TypeError('Function: Missing name, params or returns arguments!');
        name = `\`${name}\``.toUpperCase();
        return `DROP FUNCTION IF EXISTS ${name};\n` +
            `SHOW WARNINGS;\n` +
            `CREATE FUNCTION ${name}${params} RETURNS ${returns}\n` +
            `BEGIN\n` +
            `${body()}\n` +
            `END;\n`;
    }
}
exports.FunctionExtension = FunctionExtension;
/**
 * groupByTable constructs a new schema by grouping columns according
 * to the table specificer.
 */
exports.groupByTable = (s, main) => util_1.reduce(s, (p, c, k) => util_1.fuse(p, {
    [(typeof c === 'object' && c.hasOwnProperty('table')) ? String(c.table) : main]: { [k]: c }
}), {});
const docopt = ` 
SQL plugin.

Usage:
  sql [--list=<string>...]

Options:
  --list=<string>  List of things.
`;
exports.default = {
    name: 'sql',
    docopt,
    init: (args) => (prog) => {
        prog.engine.addExtension('procedure', new ProcedureExtension());
        prog.engine.addExtension('function', new FunctionExtension());
        prog.after.push((p) => {
            p.context.tables = exports.groupByTable(p.context.document, String(p.context.document['title']));
            p.context['columns'] = p.context.document.properties;
            p.context['args'] = args;
            return resolve(p);
        });
        return resolve(prog);
    }
};
//# sourceMappingURL=index.js.map