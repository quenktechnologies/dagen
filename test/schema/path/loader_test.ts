import * as must from 'must/register';
import * as Promise from 'bluebird';
import { Object } from '@quenk/noni/lib/data/json';
import { match } from '@quenk/noni/lib/control/match';
import { load } from '../../../src/schema/loader';

const loader = {

    load: (s: string): Promise<Object> => Promise.resolve(<Object>match(s)
        .caseOf('audit', () => ({ created: '2009-01-3', creator: 375 }))
        .caseOf('person', () => ({ name: 'Someone', age: 24, tags: { enabled: [1, 2, 3] } }))
        .caseOf('provider', () => ({ company: 'Lawrence', code: 7778, name: 'auguma' }))
        .caseOf('version', () => ({ version: 1021 }))
        .caseOf('recursive', () => ({ $ref: 'audit', properties: { $ref: 'version' } }))
        .orElse(() => ({}))
        .end()),

    create: () => this

}

describe('loader', () => {

    describe('load', () => {

        it('should load all $ref properties', () => {

            let o = {

                type: 'object',
                $ref: 'version',
                properties: {

                    $ref: ['audit', 'person', 'provider'],

                    options: {

                        enabled: 'all',
                        $ref: 'version'

                    }
                }
            };

            let r = {

                type: 'object',
                version: 1021,
                properties: {

                    created: '2009-01-3',
                    creator: 375,
                    name: 'auguma',
                    age: 24,
                    tags: { enabled: [1, 2, 3] },
                    company: 'Lawrence',
                    code: 7778,
                    options: {

                        enabled: 'all',
                        version: 1021

                    }
                }

            };

            return load(loader)(o).then(o => must(o).eql(r))

        })
    })

    it('should load recursively', () => {

        let o = {
            type: 'object',
            properties: {
                $ref: 'version',
                nested: { $ref: 'recursive' }
            }
        };

        let r = {

            type: 'object',
            properties: {

                version: 1021,
                nested: {

                    created: '2009-01-3',
                    creator: 375,
                    properties: {

                        version: 1021

                    }
                }

            }

        };

        return load(loader)(o).then(o => must(o).eql(r));

    });
})
