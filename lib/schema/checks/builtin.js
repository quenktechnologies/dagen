"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = exports.root = exports.definitions = exports.defs = exports.providers = void 0;
const strings = require("@quenk/preconditions/lib/string");
const numbers = require("@quenk/preconditions/lib/number");
const arrays = require("@quenk/preconditions/lib/array");
const prec = require("@quenk/preconditions");
const function_1 = require("@quenk/noni/lib/data/function");
const _1 = require("./");
/**
 * providers available for the '$checks' section.
 */
exports.providers = {
    eq: prec.eq,
    neq: prec.neq,
    nn: (0, function_1.cons)(prec.notNull),
    gt: numbers.gt,
    lt: numbers.lt,
    uppercase: (0, function_1.cons)(strings.uppercase),
    lowercase: (0, function_1.cons)(strings.lower),
    maxLength: strings.maxLength,
    minLength: strings.minLength,
    trim: (0, function_1.cons)(strings.trim),
    pattern: (s) => strings.matches(new RegExp(s)),
    maxItems: arrays.max,
    minItems: arrays.min
};
exports.defs = {
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
    tuple: {
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
                type: 'array',
                items: {
                    type: 'ref',
                    ref: 'schema'
                }
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
            tuple: {
                type: 'ref',
                ref: 'tuple'
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
};
exports.definitions = {
    type: 'object',
    definitions: exports.defs,
    additionalProperties: {
        type: 'ref',
        ref: 'schema'
    }
};
/**
 * root is a Data Document Schema root schema
 * described using a Data Document Schema.
 */
exports.root = {
    definitions: exports.defs,
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
exports.check = (0, _1.fromSchema)((new _1.Context({}, exports.providers))
    .addChecks(exports.root.definitions))(exports.root);
//# sourceMappingURL=builtin.js.map