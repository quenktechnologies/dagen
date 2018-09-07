import * as must from 'must/register';
import { normalize } from '../../src/schema';

const sample = {

    type: 'object',
    definitions: {

        name: 'string',

    },
    properties: {

        id: 'number',

        name: '#name',

        age: {

            type: 'sum',

            variants: {

                dob: 'string',

                age: 'number'

            }

        },

        tags: {

            type: 'array',
            items: 'string'

        },

        flags: {

            type: 'object',
            additionalProperties: 'number'

        }

    }

}

const expanded = {

    type: 'object',
    definitions: {

        name: {

            type: 'string'

        }

    },
    properties: {

        id: {

            type: 'number'

        },

        name: {

            type: '#name'

        },

        age: {

            type: 'sum',

            variants: {

                dob: {

                    type: 'string'

                },

                age: {

                    type: 'number'

                }

            }

        },

        tags: {

            type: 'array',
            items: {

                type: 'string'

            }

        },

        flags: {

            type: 'object',
            additionalProperties: {

                type: 'number'

            }

        }

    }

}



describe('schema', () => {

    describe('normalize', () => {

        it('should expand all supported places', () => {

            must(normalize(sample)).eql(expanded);

        });

    });

});
