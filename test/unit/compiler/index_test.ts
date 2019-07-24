import { assert } from '@quenk/test/lib/assert';
import { toPromise, pure } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../../../src/compiler';
import { MemoryLoader } from '../../../src/schema/loader/memory';
import { Schema } from '../../../src/schema';

const oSchema = {

    definitions: {

        'ts:date': 'Date',

        'sql:date': 'DATETIME',

        'address': {

            'type': 'string',

            'validation:checks': ['address', 'exists']

        }

    },
    type: 'object',

    title: 'Person',

    'js:title': 'JSPerson',

    properties: {

        name: {

            type: 'object',

            properties: {

                'first.type': 'string',

                'last.type': 'string'

            }

        },

        age: '#date',

        addresses: {

            type: 'array',

            items: {

                type: '#address',

            }

        },
        'ts:available': { '$ref': 'available' }

    },
    procedures: {

        get: {

            params: {

                id: {

                    'sql:type': 'INT',

                    'ts:type': 'number',

                    'ts:return': 'Promise<any>'

                },

                'ts:conn.type': 'any'

            }

        }

    }

}
const compileShouldWork = {

    'definitions': {
        'address': {
            'type': 'string'
        },
        'date': {
            'type': 'Date'
        }
    },
    'type': 'object',
    'title': 'Person',
    'properties': {
        'name': {
            'type': 'object',
            'properties': {
                'first': {
                    'type': 'string'
                },
                'last': {
                    'type': 'string'
                }
            }
        },
        'age': {
            'type': 'Date'
        },
        'addresses': {
            'type': 'array',
            'items': {
                'type': 'string'
            }
        },
        'available': {
            'type': 'object',
            'properties': {
                'from': {
                    'type': 'Date'
                },
                'to': {
                    'type': 'Date'
                }
            }
        }
    },
    'procedures': {
        'get': {
            'params': {
                'id': {
                    'type': 'number',
                    'return': 'Promise<any>'
                },
                'conn': {
                    'type': 'any'
                }
            }
        }
    }
}

const beforeOutput = {

    type: 'object',
    title: 'Person',
    properties: {

        name: {

            type: 'string'

        }
    }
}

const beforeOutputResult = {

    type: 'object',
    title: 'Person',
    version: '0.0.1',
    properties: {

        name: {

            type: 'string'

        }
    }
}

const ctx = new Context({}, ['ts'], [], new MemoryLoader('', {

    address: {
        type: 'string'
    },
    date: {
        type: 'Date'
    },
    available: {

        type: 'object',
        properties: {

            'from.type': '#date',
            'to.type': '#date',
            'sql:recorded': '#date'

        }

    }

}));

const plugin = (results: { [key: string]: boolean }) => ({

    beforeOutput: (s: Schema) => {

        results.beforeOutput = true;
        s.version = '0.0.1';
        return pure(s);

    }

});

describe('compiler', () => {

    describe('compile', () => {

        it('should work', () => toPromise(ctx.compile(oSchema)
            .map(s => assert(s).equate(compileShouldWork))));

        it('should invoke the beforeOutput hook', () =>
            toPromise(
                ctx
                    .setPlugin(plugin({}))
                    .compile(beforeOutput)
                    .map(s => assert(s).equate(beforeOutputResult))))
    })
})
