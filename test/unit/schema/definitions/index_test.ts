import * as must from 'must/register';
import { resolve } from '../../../../src/schema/definitions';

const defs = {

    int: {

        type: 'int'

    },

    name: {

        type: 'object',

        properties: {

            first: {

                type: 'string'

            },
            last: {

                type: 'string'
            }
        }

    },
    age: {

        type: 'number'

    },

    status: {

        type: 'sum',

        variants: {

            active: {

                type: 'boolean'

            },
            flagged: {

                type: 'number'


            }

        }

    },

    string: {

        type: 'string'

    }

}

const $r = resolve(defs);

describe('definitions', () => {

    describe('resolve', () => {

        it('should resolve definitions on objects', () => {

            must($r({

                type: 'object',
                properties: {

                    id: { type: 'number' },

                    clan: { type: '#string' },

                    name: { type: '#name' },

                    age: { type: '#age' },

                    flags: { type: 'array', items: { type: '#string' } },

                    status: { type: '#status' }
                },

                additionalProperties: { type: '#int' }

            }).takeRight()).eql({
                'type': 'object',
                'properties': {
                    'id': {

                        'type': 'number'

                    },
                    'clan': {
                        'type': 'string'
                    },
                    'flags': {

                        'type': 'array',
                        'items': {

                            'type': 'string'

                        }

                    },
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
                        'type': 'number'
                    },
                    'status': {
                        'type': 'sum',
                        'variants': {
                            'active': {
                                'type': 'boolean'
                            },
                            'flagged': {
                                'type': 'number'
                            }
                        }
                    }
                },
                'additionalProperties': {

                    type: 'int'

                }
            });

        });

        it('should resolve sum types', () => {

            must($r({

                type: 'sum',
                variants: {
                    person: {
                        type: 'object',
                        properties: {

                            name: { type: '#name' }

                        }

                    },
                    company: {

                        type: 'object',

                        additionalProperties: { type: '#int' }

                    }
                }

            }).takeRight()).eql({
                'type': 'sum',
                'variants': {
                    'person': {
                        'type': 'object',
                        'properties': {
                            'name': {
                                'type': 'object',
                                'properties': {
                                    'first': {
                                        'type': 'string'
                                    },
                                    'last'
                                        : {
                                        'type': 'string'
                                    }
                                }
                            }
                        }
                    },
                    'company': {
                        'type': 'object',
                        'additionalProperties': {
                            'type': 'int'
                        }
                    }
                }
            });

        });
    });

});

