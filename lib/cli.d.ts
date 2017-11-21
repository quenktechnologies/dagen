/// <reference path="../src/docopt.d.ts" />
import { Options } from '.';
/**
 * Arguments that are excepted from the command line.
 */
export interface Arguments {
    '<file>': string;
    '--template'?: string;
    '--context'?: string[];
    '--templates'?: string;
    '--plugin'?: string[];
    '--concern'?: string;
}
/**
 * args2Options converts command line options to an Options record.
 */
export declare const args2Options: (args: Arguments) => Options;
