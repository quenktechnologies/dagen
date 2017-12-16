import * as Promise from 'bluebird';
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
/**
 * groupByTable constructs a new schema by grouping columns according
 * to the table specificer.
 */
export declare const groupByTable: (s: any, main: string) => any;
declare const _default: (args: string[]) => (prog: any) => Promise<any>;
export default _default;
