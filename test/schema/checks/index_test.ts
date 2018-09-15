import * as must from 'must/register';
import { set } from 'property-seek';
import { Value, Object } from '@quenk/noni/lib/data/json';
import { Failure } from '@quenk/preconditions/lib/result';
import { map } from '@quenk/noni/lib/data/record';
import { Check, fromSchemas, fromSchema } from '../../../src/schema/checks';
import { Schemas } from '../../../src/schema';

const schemas: Schemas = {

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

    },
    ref: {

        type: 'ref',
        path: 'object'

    }

};

const rSchema = {

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

const samples: Object = {

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

    sum: true,

    ref: { yes: true }

}

describe('checks', () => {

    describe('fromSchemas', () => {

        it('should produce checks from a Schemas map', () => {

            let r = map(<any>fromSchemas(schemas),
                (c: Check<Value>, k: string) => c(samples[k]).takeRight());

            must(r)
                .eql({
                    string: 'this is a string',
                    number: 12,
                    boolean: true,
                    object:
                    {
                        name: 'Otis Juma',
                        age: 24,
                        profile: 1256,
                        flags: { active: true, locked: false, outstanding: true },
                        tags: ['user', 'active', 'unlocked'],
                        contact: { home: '6995534', email: 'me@meme.com', fax: 'N/A' }
                    },
                    array: [{ id: 1 }, { id: 12 }, { id: 24 }],
                    sum: true,
                    ref: { yes: true }
                });

        })

        it('should allow recursion', () => {

            let samples = {

                string: 'the string',

                object: {

                    prop: 'the prop'
                }

            };

            let wrong = {

                string: 1,

                object: {

                    prop: false
                }

            }

            let r = map(<any>fromSchemas(rSchema),
                (c: Check<Value>, k: string) => c(samples[k]).takeRight());

            let w = map(<any>fromSchemas(rSchema),
                (c: Check<Value>, k: string) => c(wrong[k]).takeLeft().explain());

            must(r).eql({

                string: 'the string',

                object: {
                    'prop': 'the prop'
                }

            });

            must(w).eql({

                string: 'isString',

                object: {

                    'prop': 'isObject'

                }
            });

        });

    })

    describe('fromSchema', () => {

        it('should produce a check for string types', () => {

            must((fromSchema({})(schemas.string)(samples.string)).takeRight())
                .be(samples.string);

            must((fromSchema({})(schemas.string)(samples.number)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a precondition for number types', () => {

            must((fromSchema({})(schemas.number)(samples.number)).takeRight())
                .be(samples.number);

            must((fromSchema({})(schemas.number)(samples.string)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a check for boolean types', () => {

            must((fromSchema({})(schemas.boolean)(samples.boolean)).takeRight())
                .be(samples.boolean);

            must((fromSchema({})(schemas.boolean)(samples.string)).takeLeft())
                .be.instanceOf(Failure);

        })

        it('should produce a precondition for object types', () => {

            let wrong =
                set('profile', {},
                    set('contact.home', 12,
                        set('flags.active', 'active', samples.object)));

          let optionaled: any = (<any>Object).assign({}, samples.object);

            delete optionaled.age;

            must((fromSchema({})(schemas.object)(samples.object)).takeRight())
                .eql(samples.object);

            must((fromSchema({})(schemas.object)(optionaled)).takeRight())
                .eql(optionaled);

            must((fromSchema({})(schemas.object)(wrong)).takeLeft().explain())
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

            must((fromSchema({})(schemas.array)(samples.array)).takeRight())
                .eql(samples.array);

            must((fromSchema({})(schemas.array)(samples.array[0])).takeLeft())
                .be.instanceOf(Failure);

        });

        it('should produce a precondition for sum types', () => {

            must((fromSchema({})(schemas.sum)(samples.string)).takeRight())
                .eql(samples.string);

            must((fromSchema({})(schemas.sum)(samples.number)).takeRight())
                .eql(samples.number);

            must((fromSchema({})(schemas.sum)(samples.boolean)).takeRight())
                .eql(samples.boolean);

            must((fromSchema({})(schemas.sum)(samples.object)).takeLeft())
                .be.instanceOf(Failure);

        });

        it('should produce a precondition for ref types ', () => {

            let ps = { object: fromSchema({})(schemas.object) };

            must((fromSchema(ps)(schemas.object)(samples.object)).takeRight())
                .eql(samples.object);

            must((fromSchema(ps)(schemas.object)(samples.string).takeLeft()))
                .be.instanceOf(Failure);

        });

    })
})
