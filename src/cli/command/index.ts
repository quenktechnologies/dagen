import * as Promise from 'bluebird';

/**
 * Command 
 */
export interface Command<R> {

  run(): Promise<R>;

}
