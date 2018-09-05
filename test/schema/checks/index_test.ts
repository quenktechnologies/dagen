import * as must from 'must/register';
import { Functor } from '@quenk/noni/lib/data/functor';
import { fromSchema } from '../../../src/schema/checks';
import { Check, CheckF, TypeOf } from '../../../src/schema/checks/check';

describe('checks', () => {

    it('fromSchema', () => {

        let fs = [];

        fromSchema({ type: 'object' })
            .run((c: CheckF<Check>) => { fs.push(c); return c.next; })

        must(fs[0]).be.instanceOf(TypeOf);

    });

});
