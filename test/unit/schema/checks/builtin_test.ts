import { must } from '@quenk/must';
import { set } from 'property-seek';
import { check } from '../../../../src/schema/checks/builtin';

const oSchema = {

    type: 'object',

    properties: {

        object: {

            type: 'object',

            title: 'Schema',

            additonalProperties: {

                type: 'string'

            }

        },
        array: {

            type: 'array',

            items: {

                type: 'string'

            }

        },
        tuple: {

            type: 'tuple',

            items: [{ type: 'nubmer' }, { type: 'string' }, { type: 'number' }]

        },
        sum: {

            type: 'sum',

            variants: {

                string: { type: 'string' },

                number: { type: 'number' },

                boolean: { type: 'boolean' }

            }

        }

    }

};

const sSchema = {

    type: 'sum',

    title: 'Sum',

    variants: {

        one: {

            type: 'object',

            properties: {

                one: { type: 'boolean' }

            }

        },
        two: {

            type: 'object',

            title: 'object',

            additionalProperties: {

                type: 'object',

                properties: { test: 'boolean' }

            }

        },
        three: {

            type: 'object',

            additionalProperties: {

                type: 'string'

            }

        }
    }
};

describe('checks', () => {

    describe('check', () => {

        it('should validate correct object schemas', () => {

            must(check(oSchema).takeRight()).equate(oSchema);

        });

        it('should invalidate incorrect object schemas', () => {

            let w = set('properties.sum.type', 'array', oSchema);
            w = set('properties.object.type', 'array', w);
            w = set('properties.tuple.type', 'array', w);
            w = set('properties.array.type', 'sum', w);
            w = set('properties.any', 'foo', w);

            must(check(w).takeLeft().explain())
                .equate({
                    "left": {
                        "left": "",
                        "right": {
                            "properties": {
                                "any": {
                                    "left": {
                                        "left": {
                                            "left": {
                                                "left": {
                                                    "left": "",
                                                    "right": "isRecord"
                                                },
                                                "right": "isRecord"
                                            },
                                            "right": "isRecord"
                                        },
                                        "right": "isRecord"
                                    },
                                    "right": "isRecord"
                                }
                            }
                        }
                    },
                    "right": { "type": "eq", "variants": "isRecord" }
                });

        });

        it('should validate correct sum schemas', () => {

            must(check(sSchema).takeRight()).equate(sSchema);

        });

    });

});
