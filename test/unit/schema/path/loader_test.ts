import * as must from 'must/register';
import * as Promise from 'bluebird';
import { Object } from '@quenk/noni/lib/data/json';
import { match } from '@quenk/noni/lib/control/match';
import { Load, Create, load } from '../../../../src/schema/loader';

class ALoader {

    load: Load = (s: string): Promise<Object> => Promise.resolve(<Object>match(s)
        .caseOf('audit', () => ({ created: '2009-01-3', creator: 375 }))
        .caseOf('person', () => ({ name: 'Someone', age: 24, tags: { enabled: [1, 2, 3] } }))
        .caseOf('provider', () => ({ company: 'Lawrence', code: 7778, name: 'auguma' }))
        .caseOf('version', () => ({ version: 1021 }))
        .caseOf('recursive', () => ({ $ref: 'audit', properties: { $ref: 'version' } }))
        .orElse(() => ({}))
        .end());

    create: Create = () => this;

}

class RLoader {

    public constructor(public cwd: string) { }

    dir = {

        'base': {

            type: 'number',
            level: { base: true },
            $ref: 'one'

        },
        'base.one': {

            level: { one: 1 },
            $ref: ['two', 'three']

        },
        'base.one.two': {

            level: { two: 2 }

        },
        'base.one.three': {

            level: { three: 3 },
            end: true

        }

    };

    load: Load = (path: string) => {

        let p = [this.cwd, path].filter(x => x).join('.');

        return this.dir.hasOwnProperty(p) ?
            Promise.resolve(this.dir[p]) :
            Promise.reject(new Error(`Unknown path '${p}'!`));

    }

    create: Create = (cwp: string) =>
        new RLoader([this.cwd, cwp].filter(x => x).join('.'));

}

const loader = new ALoader();
const rloader = new RLoader('');

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

    it('should adjust the Loader CWD for at each step', () => {


        let o = {

            type: 'sum',
            variants: {

                random: { type: 'string' },
                base: { $ref: 'base' }

            }

        };

        let r = {

            type: 'sum',

            variants: {

                random: {

                    type: 'string'

                },

                base: {

                    type: 'number',

                    level: {

                        base: true,
                        one: 1,
                        two: 2,
                        three: 3

                    },
                    end: true

                }

            }

        }

        return load(rloader)(o).then(o => must(o).eql(r));

    });
})
