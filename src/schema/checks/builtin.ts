import * as strings from '@quenk/preconditions/lib/string';
import * as numbers from '@quenk/preconditions/lib/number';
import * as arrays from '@quenk/preconditions/lib/array';
import * as prec from '@quenk/preconditions';
import { Value } from '@quenk/noni/lib/data/json';
import { cons } from '@quenk/noni/lib/data/function';
import { Providers } from './provider';
import { Root, ObjectType, Schema } from '../';
import {Definitions} from '../definitions';
import { Check, Context, fromSchema } from './';

/**
 * providers available for the '$checks' section.
 */
export const providers: Providers<Value> = {

    eq: prec.eq,

    neq: prec.neq,

    nn: cons(prec.nn),

    gt: numbers.gt,

    lt: numbers.lt,

    uppercase: cons(strings.uppercase),

    lowercase: cons(strings.lower),

    maxLength: strings.maxLength,

    minLength: strings.minLength,

    trim: cons(strings.trim),

    pattern: (s: string) => strings.matches(new RegExp(s)),

    maxItems: arrays.maxItems,

    minItems: arrays.minItems

}

export const defs: Definitions  = {

        object: {

            type: 'object',

            properties: {

                definitions: {

                    type: 'object',

                    optional: true,

                    additonalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                },
                type: {

                    type: 'string'

                },
                title: {

                    type: 'string',

                    optional: true

                },
                properties: {

                    type: 'object',

                    optional: true,

                    additionalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }
                },
                additionalProperties: {

                    type: 'ref',

                  ref: 'schema', 

                  optional: true

                }

            }

        },
        array: {

            type: 'object',

            properties: {

                definitions: {

                    type: 'object',

                    optional: true,

                    additonalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                },

                type: {

                    type: 'string'

                },
                title: {

                    type: 'string',

                    optional: true

                },
                items: {

                    type: 'ref',

                    ref: 'schema'

                }

            }

        },
        sum: {

            type: 'object',

            properties: {

                definitions: {

                    type: 'object',

                    optional: true,

                    additonalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                },
                type: {

                    type: 'string'

                },

                title: {

                    type: 'string',

                    optional: true

                },
                variants: {

                    type: 'object',

                    additionalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                }

            }

        },
        external: {

            type: 'object',

            properties: {

                definitions: {

                    type: 'object',

                    optional: true,

                    additonalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                },
                type: {

                    type: 'string',

                    $checks: [

                        { name: 'neq', parameters: ['object'] },

                        { name: 'neq', parameters: ['array'] },

                        { name: 'neq', parameters: ['sum'] }

                    ]

                }

            },
            title: {

                type: 'string',

                optional: true

            }

        },
        schema: {

            type: 'sum',

            variants: {

                object: {

                    type: 'ref',

                    ref: 'object'

                },
                array: {

                    type: 'ref',

                    ref: 'array'

                },
                sum: {

                    type: 'ref',

                    ref: 'sum'

                },
                external: {

                    type: 'ref',

                    ref: 'external'

                }

            }

        }

    }

export const definitions: ObjectType = {

  type: 'object',

    definitions: defs,

  additionalProperties: {

    type: 'ref',

    ref: 'schema'

  }

}

/**
 * root is a Data Document Schema root schema 
 * described using a Data Document Schema.
 */
export const root: Root = {

    definitions: defs,

    type: 'sum',

    variants: {

        objectType: {

            type: 'ref',

            ref: 'object'

        },
        sumType: {

            type: 'object',

            properties: {

                definitions: {

                    type: 'object',

                    optional: true,

                    additonalProperties: {

                        type: 'ref',

                        ref: 'schema'

                    }

                },
                type: {

                    type: 'string',

                    $checks: [{ name: 'eq', parameters: ['sum'] }]

                },
                title: {

                    type: 'string',

                    optional: true

                },
                variants: {

                    type: 'object',

                    additionalProperties: {

                        type: 'ref',

                        ref: 'object'

                    }

                }

            }

        }

    }

};

export const check: Check<Schema> = fromSchema<Schema>((
    new Context<Schema>({}, providers))
    .addChecks(root.definitions))(root);

