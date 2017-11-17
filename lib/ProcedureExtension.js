"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ProcedureExtension is a nunjucks extension for writing
 * sql procedures without all the noise.
 */
var ProcedureExtension = /** @class */ (function () {
    function ProcedureExtension() {
        this.tags = ['procedure'];
    }
    ProcedureExtension.prototype.parse = function (parser, nodes, _lexer) {
        // get the tag token
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endprocedure');
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtension(this, 'run', args, [body]);
    };
    ProcedureExtension.prototype.run = function (_context, name, params, body) {
        if (arguments.length != 4)
            throw new TypeError('Procedure: Missing procedure name or body!');
        name = ("`" + name + "`").toUpperCase();
        return "DROP PROCEDURE IF EXISTS " + name + ";\n" +
            "SHOW WARNINGS;\n" +
            ("CREATE PROCEDURE " + name + params + "\n") +
            "BEGIN\n" +
            (body() + "\n") +
            "END;\n";
    };
    return ProcedureExtension;
}());
exports.ProcedureExtension = ProcedureExtension;
var FunctionExtension = /** @class */ (function () {
    function FunctionExtension() {
        this.tags = ['function'];
    }
    FunctionExtension.prototype.parse = function (parser, nodes, _lexer) {
        // get the tag token
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);
        // parse the body and possibly the error block, which is optional
        var body = parser.parseUntilBlocks('endfunction');
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtension(this, 'run', args, [body]);
    };
    FunctionExtension.prototype.run = function (_context, name, params, returns, body) {
        if (arguments.length != 5)
            throw new TypeError('Function: Missing name, params or returns arguments!');
        name = ("`" + name + "`").toUpperCase();
        return "DROP FUNCTION IF EXISTS " + name + ";\n" +
            "SHOW WARNINGS;\n" +
            ("CREATE FUNCTION " + name + params + " RETURNS " + returns + "\n") +
            "BEGIN\n" +
            (body() + "\n") +
            "END;\n";
    };
    return FunctionExtension;
}());
exports.FunctionExtension = FunctionExtension;
//# sourceMappingURL=ProcedureExtension.js.map