import * as schema from './fixtures/schema';
import * as samples from './fixtures/samples';
import { must } from '@quenk/must';
import { set } from 'property-seek';
import { Value } from '@quenk/noni/lib/data/json';
import { PrimFailure, DualFailure } from '@quenk/preconditions/lib/result/failure';
import { map } from '@quenk/noni/lib/data/record';
import { range } from '@quenk/preconditions/lib/number';
import { lower, trim } from '@quenk/preconditions/lib/string';
import { eq } from '@quenk/preconditions';
import { Providers } from '../../../../src/schema/checks/provider';
import { Check, Context, fromSchema } from '../../../../src/schema/checks';

const providers: Providers<Value> = {

    range: range,
    eq: eq,
    lower: () => lower,
    trim: () => trim

};

const ctx = new Context({}, providers);

describe('checks', () => {

    describe('Context', () => {

        describe('addChecks', () => {

            it('should source checks from a map', () => {

                let ctx = new Context();
                let r = map(<any>ctx.addChecks(schema.all).checks,
                    (c: Check<Value>, k: string) => c(samples.all[k]).takeRight());

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
                            contact: {
                                home: '6995534',
                                email: 'me@meme.com',
                                fax: 'N/A'
                            }
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

                let r = map(<any>ctx.addChecks(schema.rSchema).checks,
                    (c: Check<Value>, k: string) => c(samples[k]).takeRight());

                let w = map(<any>ctx.addChecks(schema.rSchema).checks,
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

                        'prop': {
                            'left': {
                                'left': '',
                                'right': 'isString'
                            },
                            'right': 'isRecord'
                        }

                    }
                });

            });


        });

    });

    describe('fromSchema', () => {

        it('should produce a check for string types', () => {

            must((fromSchema(ctx)(schema.string)(samples.string)).takeRight())
                .equal(samples.string);

            must((fromSchema(ctx)(schema.string)(samples.number)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for number types', () => {

            must((fromSchema(ctx)(schema.number)(samples.number)).takeRight())
                .equal(samples.number);

            must((fromSchema(ctx)(schema.number)(samples.string)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a check for boolean types', () => {

            must((fromSchema(ctx)(schema.boolean)(samples.boolean)).takeRight())
                .equal(samples.boolean);

            must((fromSchema(ctx)(schema.boolean)(samples.string)).takeLeft())
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for object types', () => {

            let wrong =
                set('profile', {},
                    set('contact.home', 12,
                        set('flags.active', 'active', samples.object)));

            let optionaled: any = (<any>Object).assign({}, samples.object);

            delete optionaled.age;

            must((fromSchema(ctx)(schema.object)(samples.object)).takeRight())
                .equate(samples.object);

            must((fromSchema(ctx)(schema.object)(optionaled)).takeRight())
                .equate(optionaled);

            must((fromSchema(ctx)(schema.object)(wrong)).takeLeft().explain())
                .equate({

                    profile: {
                        'left': {
                            'left': '',
                            'right': 'isString'
                        },
                      'right': 'isNumber',
                    },
                    flags: {

                        active: 'isBoolean'
                    },
                    contact: {
                        home: 'isString'
                    }
                })
        })

        it('should produce a precondition for array types', () => {

            must((fromSchema(ctx)(schema.array)(samples.array)).takeRight())
                .equate(samples.array);

            must((fromSchema(ctx)(schema.array)(samples.array[0])).takeLeft())
                .be.instance.of(PrimFailure);

        });

        it('should produce a precondition for an array of numbers', () => {

            must((fromSchema(ctx)(schema.arrayOfNumbers)([0, 1, 2])).takeRight())
                .equate([0, 1, 2]);

            must((fromSchema(ctx)(schema.arrayOfNumbers)(['0', '1', '2']))
                .takeLeft().explain()).equate({

                    '0': 'isNumber',
                    '1': 'isNumber',
                    '2': 'isNumber'

                });

        })

        it('should produce a precondition for sum types', () => {

            must((fromSchema(ctx)(schema.sum)(samples.string)).takeRight())
                .equal(samples.string);

            must((fromSchema(ctx)(schema.sum)(samples.number)).takeRight())
                .equal(samples.number);

            must((fromSchema(ctx)(schema.sum)(samples.boolean)).takeRight())
                .equal(samples.boolean);

            must((fromSchema(ctx)(schema.sum)(samples.object)).takeLeft())
                .be.instance.of(DualFailure);

        })

        it('should produce a precondition for ref types ', () => {

            let ps = new Context({ object: fromSchema(ctx)(schema.object) });

            must((fromSchema(ps)(schema.object)(samples.object)).takeRight())
                .equate(samples.object);

            must((fromSchema(ps)(schema.object)(samples.string).takeLeft()))
                .be.instance.of(PrimFailure);

        })

        it('should produce a precondition for ref types ', () => {

            must((fromSchema(ctx)(schema.withChecks)(samples.withChecks)).takeRight())
                .equate(set('profile', 'uname', samples.withChecks));

            must((fromSchema(ctx)(schema.withChecks)(samples.withChecksWrong))
                .takeLeft().explain())
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
                    'profile': {
                        'left': {
                            'left': '',
                            'right': 'eq'
                        },
                        'right': 'isNumber'
                    }
                });

        })

        it('should not mangle schema has nested arrays', () => {

            must((fromSchema(ctx)(schema.mangledNestedArraySchema)
                (samples.mangledNestedArraySample)).takeRight())
                .equate(samples.mangledNestedArraySample);

            // must((fromSchema(ctx)(schema.array)(samples.array[0])).takeLeft())
            //    .be.instance.of(PrimFailure);

        });



    })
})
