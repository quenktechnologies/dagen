import * as must from 'must/register';
import { set } from 'property-seek';
import { Failure } from '@quenk/preconditions';
import { fromSchema } from '../../../src/schema/checks';

const schemas = {

    string: {

        type: 'string',

    },
    number: {

        type: 'number'

    },
    boolean: {

        type: 'boolean'

    },
    object: {

        type: 'object',
        properties: {

            name: { type: 'string' },

            age: { type: 'number' },

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

                    },

                    additionalProperties: { type: 'boolean' }

                }

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

    },

    array: {

        type: 'array',

        items: { type: 'object', properties: { id: { type: 'number' } } }

    },

    sum: {

        type: 'sum',

        variants: {

            string: { type: 'string' },

            boolean: { type: 'boolean' },

            number: { type: 'number' }

        }

    }

};

const samples = {

    string: 'this is a string',

    number: 12,

    boolean: true,

    object: {

        name: 'Otis Juma',

        age: 24,

        profile: 1256,

        flags: {

            active: true,

            locked: false,

            outstanding: true

        },

        tags: ['user', 'active', 'unlocked'],

        contact: {

            home: '6995534',

            email: 'me@meme.com',

            fax: 'N/A'

        }

    },

    array: [{ id: 1 }, { id: 12 }, { id: 24 }],

    sum: true

}

describe('checks', () => {

    describe('fromSchema', () => {

        it('should produce a preconditions for string types', () => {

            must((fromSchema(schemas.string)(samples.string)).takeRight())
                .be(samples.string);

            must((fromSchema(schemas.string)(samples.number)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a precondition for number types', () => {

            must((fromSchema(schemas.number)(samples.number)).takeRight())
                .be(samples.number);

            must((fromSchema(schemas.number)(samples.string)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a preconditions for boolean types', () => {

            must((fromSchema(schemas.boolean)(samples.boolean)).takeRight())
                .be(samples.boolean);

            must((fromSchema(schemas.boolean)(samples.string)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a precondition for object types', () => {

            let wrong =
                set('profile', {},
                    set('contact.home', 12,
                        set('flags.active', 'active', samples.object)));

            must((fromSchema(schemas.object)(samples.object)).takeRight())
                .eql(samples.object);

            must((fromSchema(schemas.object)(wrong)).takeLeft().explain())
                .eql({
                    profile: 'isNumber',
                    flags: {

                        active: 'isBoolean'
                    },
                    contact: {
                        home: 'isString'
                    }
                })
        })

        it('should produce a precondition for array types', () => {

            must((fromSchema(schemas.array)(samples.array)).takeRight())
                .eql(samples.array);

            must((fromSchema(schemas.array)(samples.array[0])).takeLeft())
                .be.instanceOf(Failure);

        });


        it('should produce a precondition for sum types', () => {

            must((fromSchema(schemas.sum)(samples.string)).takeRight())
                .eql(samples.string);

            must((fromSchema(schemas.sum)(samples.number)).takeRight())
                .eql(samples.number);

            must((fromSchema(schemas.sum)(samples.boolean)).takeRight())
                .eql(samples.boolean);

            must((fromSchema(schemas.sum)(samples.object)).takeLeft())
                .be.instanceOf(Failure);

        });
    })
})
