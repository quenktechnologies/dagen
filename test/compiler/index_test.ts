import * as must from 'must/register';
import { Context, compile } from '../../src/compiler';
import { MemoryLoader } from '../../src/schema/loader/memory';

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

        }

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

const ctx = new Context({}, ['ts'], [], new MemoryLoader('', {}));

describe('compiler', () =>
    describe('compile', () =>
        (compile(ctx)(oSchema))
            .then(s => must(s).eql({
      
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
                } ))));
