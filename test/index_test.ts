import * as must from 'must/register';
import { resolveRef } from '../src';

describe('resolveRef', function() {

    it('should recursively merge documents', function() {

        let path = `${__dirname}/data/ref1.json`;

        return resolveRef(path)(require(path))
            .then(v => must(v).eql({
                hits: [2, 3, 1],
                flags:
                {
                    horns: { ivory: false, gold: true },
                    active: true,
                    blocked: 'false'
                },
                alias: 'Agatha',
                name: 'Makeda'
            }))

    });

});

