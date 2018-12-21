import { must } from '@quenk/must';
import { set } from 'property-seek';
import { Value, Object } from '@quenk/noni/lib/data/json';
import { PrimFailure } from '@quenk/preconditions/lib/result/failure';
import { ArrayFailure } from '@quenk/preconditions/lib/result/failure/array';
import { map } from '@quenk/noni/lib/data/record';
import { range } from '@quenk/preconditions/lib/number';
import { lower, trim } from '@quenk/preconditions/lib/string';
import { eq } from '@quenk/preconditions';
import { Schemas } from '../../../../src/schema';
import { Providers } from '../../../../src/schema/checks/provider';
import { Check, Context, fromSchema } from '../../../../src/schema/checks';

const providers: Providers<Value> = {

    range: range,
    eq: eq,
    lower: () => lower,
    trim: () => trim

};

const ctx = new Context({}, providers);

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

const withChecks = {

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
                    $checks: [{ name: 'trim' }, { name: 'lower' }, { name: 'eq', parameters: ['uname'] }]

                },
                id: {

                    type: 'number'

                }

            }


        }

    }

};

const withChecksSamples = {

    name: 'Larry',

    clients: {

        bmobile: 6,
        ttec: 10,
        cal: 7

    },
    flags: [25, 48, 32],

    profile: '     UnAME    '

};

const withChecksWrong = {

    name: 'larry',

    clients: {

        bmobile: '6',
        ttec: 210,
        cal: [7]

    },
    flags: [25, 100, 48, 9],

    profile: 'parolor'

};

describe('checks', () => {

    describe('Context', () => {

        describe('addChecks', () => {

            it('should source checks from a map', () => {

                let ctx = new Context();
                let r = map(<any>ctx.addChecks(schemas).checks,
                    (c: Check<Value>, k: string) => c(samples[k]).takeRight());

                must(r)
                    .equate({
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

                let ctx = new Context();

                let r = map(<any>ctx.addChecks(rSchema).checks,
                    (c: Check<Value>, k: string) => c(samples[k]).takeRight());

                let w = map(<any>ctx.addChecks(rSchema).checks,
                    (c: Check<Value>, k: string) => c(wrong[k]).takeLeft().explain());

                must(r).equate({

                    string: 'the string',

                    object: {
                        'prop': 'the prop'
                    }

                });

                must(w).equate({

                    string: 'isString',

                    object: {

                        'prop': 'isRecord'

                    }
                });

            });


        });

    });

    describe('fromSchema', () => {

        it('should produce a check for string types', () => {

            must((fromSchema(ctx)(schemas.string)(samples.string)).takeRight())
                .equal(samples.string);

            must((fromSchema(ctx)(schemas.string)(samples.number)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for number types', () => {

            must((fromSchema(ctx)(schemas.number)(samples.number)).takeRight())
                .equal(samples.number);

            must((fromSchema(ctx)(schemas.number)(samples.string)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a check for boolean types', () => {

            must((fromSchema(ctx)(schemas.boolean)(samples.boolean)).takeRight())
                .equal(samples.boolean);

            must((fromSchema(ctx)(schemas.boolean)(samples.string)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for object types', () => {

            let wrong =
                set('profile', {},
                    set('contact.home', 12,
                        set('flags.active', 'active', samples.object)));

            let optionaled: any = (<any>Object).assign({}, samples.object);

            delete optionaled.age;

            must((fromSchema(ctx)(schemas.object)(samples.object)).takeRight())
                .equate(samples.object);

            must((fromSchema(ctx)(schemas.object)(optionaled)).takeRight())
                .equate(optionaled);

            must((fromSchema(ctx)(schemas.object)(wrong)).takeLeft().explain())
                .equate({
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

            must((fromSchema(ctx)(schemas.array)(samples.array)).takeRight())
                .equate(samples.array);

            must((fromSchema(ctx)(schemas.array)(samples.array[0])).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for sum types', () => {

            must((fromSchema(ctx)(schemas.sum)(samples.string)).takeRight())
                .equal(samples.string);

            must((fromSchema(ctx)(schemas.sum)(samples.number)).takeRight())
                .equal(samples.number);

            must((fromSchema(ctx)(schemas.sum)(samples.boolean)).takeRight())
                .equal(samples.boolean);

            must((fromSchema(ctx)(schemas.sum)(samples.object)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for ref types ', () => {

            let ps = new Context({ object: fromSchema(ctx)(schemas.object) });

            must((fromSchema(ps)(schemas.object)(samples.object)).takeRight())
                .equate(samples.object);

            must((fromSchema(ps)(schemas.object)(samples.string).takeLeft()))
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for ref types ', () => {

            must((fromSchema(ctx)(withChecks)(withChecksSamples)).takeRight())
                .equate(set('profile', 'uname', withChecksSamples));

            must((fromSchema(ctx)(withChecks)(withChecksWrong)).takeLeft().explain())
                .equate({
                    'name': 'eq',
                    'clients': {
                        'bmobile': 'isNumber',
                        'ttec': 'range.max',
                        'cal': 'isNumber'
                    },
                    'flags': {

                        '1': 'range.max',
                        '3': 'range.min'
                    },
                    'profile': 'isNumber'
                });

        })

    })
})
