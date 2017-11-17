
/**
 * ProcedureExtension is a nunjucks extension for writing 
 * sql procedures without all the noise.
 */
export class ProcedureExtension {

    tags = ['procedure'];

    parse(parser: any, nodes: any, _lexer: any) {

        // get the tag token
        var tok = parser.nextToken();

        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endprocedure');

        parser.advanceAfterBlockEnd();

        return new nodes.CallExtension(this, 'run', args, [body]);

    }

    run(_context: any, name: string, params: any, body: any) {

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

export class FunctionExtension {

    tags = ['function'];

    parse(parser: any, nodes: any, _lexer: any) {

        // get the tag token
        var tok = parser.nextToken();

        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endfunction');

        parser.advanceAfterBlockEnd();

        return new nodes.CallExtension(this, 'run', args, [body]);

    }

    run(_context: any, name: string, params: any, returns: any, body: any) {

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
