import { must } from '@quenk/must';
import { toPromise } from '@quenk/noni/lib/control/monad/future';
import { Context, compile } from '../../../src/compiler';
import { MemoryLoader } from '../../../src/schema/loader/memory';

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
          'sql:recorded':  '#date'

        }

    }


}), []);

describe('compiler', () =>
    describe('compile', () =>
        it('should work', () => toPromise(compile(ctx)(oSchema)
            .map(s => must(s).equate({

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
            }))))));
