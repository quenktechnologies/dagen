import { format } from 'prettier';

import { Context } from '../compiler';
import { Schema } from '../schema';
import { AbstractPlugin } from './';

/**
 * PrettyPlugin formats the final output using prettier.
 */
export class PrettyPlugin extends AbstractPlugin {
    constructor(
        context: Context,
        public parser: string
    ) {
        super(context);
    }

    name = 'pretty';

    async onOutput(_: Schema, output: string): Promise<string> {
        return format(output, { parser: this.parser });
    }
}
