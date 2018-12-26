import { Schemas } from '../../../../../src/schema';

export const string = {

    type: 'string',

};

export const number = {

    type: 'number'

};

export const boolean = {

    type: 'boolean'

};

export const object = {

    type: 'object',
    properties: {

        name: { type: 'string' },

        age: { type: 'number', optional: true },

        profile: {

            type: 'sum',

            variants: {

                main: {

                    type: 'string'

                },

                avatar: {

                    type: 'number'
                }
            }

        },
        flags: {

            type: 'object',
            properties: {

                active: {

                    type: 'boolean'

                }
            },

            additionalProperties: { type: 'boolean' }

        },

        tags: {

            type: 'array',

            items: { type: 'string' }

        },

        contact: {

            type: 'object',

            additionalProperties: {

                type: 'string'
            }
        }

    }
};

export const array = {

    type: 'array',

    items: { type: 'object', properties: { id: { type: 'number' } } }

};

export const sum = {

    type: 'sum',

    variants: {

        string: { type: 'string' },

        boolean: { type: 'boolean' },

        number: { type: 'number' }

    }

};

export const ref = {

    type: 'ref',
    path: 'object'

}

export const all: Schemas = {
    string,
    number,
    boolean,
    object,
    array,
    sum,
    ref
};


export const rSchema = {

    string: {

        type: 'string'

    },
    object: {

        type: 'object',
        additionalProperties: {

            type: 'sum',
            variants: {

                string: {

                    type: 'ref',
                    ref: 'string'

                },
                object: {

                    type: 'ref',
                    ref: 'object'

                }

            }

        }

    }

};

export const withChecks = {

    type: 'object',

    properties: {

        name: {

            type: 'string',

            $checks: [{ name: 'eq', parameters: ['Larry'] }]

        },
        clients: {

            type: 'object',

            additionalProperties: {

                type: 'number',

                $checks: [{ name: 'range', parameters: [6, 12] }]

            }

        },
        flags: {

            type: 'array',

            items: {

                type: 'number',

                $checks: [{ name: 'range', parameters: [24, 48] }]

            }

        },
        profile: {

            type: 'sum',

            variants: {

                uname: {

                    type: 'string',
                    $checks: [
                        { name: 'trim' },
                        { name: 'lower' },
                        { name: 'eq', parameters: ['uname'] }]

                },
                id: {

                    type: 'number'

                }

            }


        }

    }

};

export const arrayOfNumbers = {

    type: 'array',

    items: { type: 'number' }

}

export const mangledNestedArraySchema = {

    'type': 'object',

    'properties': {

        'procedures': {

            'type': 'object',

            'optional': 'true',

            'additionalProperties': {

                'type': 'object',

                'properties': {

                    'imports': {

                        'type': 'object',

                        'optional': 'true',

                        'additionalProperties': {

                            'type': 'string'

                        }

                    },
                    'parameters': {

                        'type': 'object',

                        'optional': true,

                        'additionalProperties': {

                            'type': 'string'

                        }

                    }

                }

            }

        }

    }

}
