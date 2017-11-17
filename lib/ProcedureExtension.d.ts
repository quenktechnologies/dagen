/**
 * ProcedureExtension is a nunjucks extension for writing
 * sql procedures without all the noise.
 */
export declare class ProcedureExtension {
    tags: string[];
    parse(parser: any, nodes: any, _lexer: any): any;
    run(_context: any, name: string, params: any, body: any): string;
}
export declare class FunctionExtension {
    tags: string[];
    parse(parser: any, nodes: any, _lexer: any): any;
    run(_context: any, name: string, params: any, returns: any, body: any): string;
}
