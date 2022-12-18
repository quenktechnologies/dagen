"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromSchema = exports.Context = exports.TYPE_REF = void 0;
const arrays = require("@quenk/preconditions/lib/array");
const records = require("@quenk/preconditions/lib/record");
const strings = require("@quenk/preconditions/lib/string");
const numbers = require("@quenk/preconditions/lib/number");
const booleans = require("@quenk/preconditions/lib/boolean");
const schema = require("../");
const match_1 = require("@quenk/noni/lib/control/match");
const record_1 = require("@quenk/noni/lib/data/record");
const preconditions_1 = require("@quenk/preconditions");
const result_1 = require("@quenk/preconditions/lib/result");
const spec_1 = require("./spec");
exports.TYPE_REF = 'ref';
/**
 * Context Checks are applied in.
 *
 * Holds useful data used during the transformation process.
 */
class Context {
    constructor(checks = {}, providers = {}) {
        this.checks = checks;
        this.providers = providers;
    }
    /**
     * addChecks to the Context from a Schemas map.
     *
     * Note: This mutates this context.
     */
    addChecks(s) {
        this.checks = (0, record_1.reduce)(s, this.checks, (p, c, k) => {
            p[k] = (0, exports.fromSchema)(this)(c);
            return p;
        });
        return this;
    }
}
exports.Context = Context;
/**
 * fromSchema rewrites a Schema to a chain of Checks.
 *
 * The first argument is a Checks map that will be used
 * for resolving ref types. If a ref type uses a path
 * that can't be resolved the precondition will always fail.
 *
 * XXX: checks on prims/externals
 */
const fromSchema = (c) => (s) => wrapOptional(s, addCustom(c, s, (0, match_1.match)(s)
    .caseOf(schema.objectShapeWithAllProperties, fromMapObject(c))
    .caseOf(schema.objectShapeWithProperties, fromObject(c))
    .caseOf(schema.objectShapeWithAdditionalProperties, fromMap(c))
    .caseOf(schema.arrayShape, fromArray(c))
    .caseOf(schema.tupleShape, fromTuple(c))
    .caseOf(schema.sumShape, fromSum(c))
    .caseOf(schema.refShape, fromRef(c))
    .caseOf(schema.stringShape, () => strings.isString)
    .caseOf(schema.numberShape, () => numbers.isNumber)
    .caseOf(schema.booleanShape, () => booleans.isBoolean)
    .caseOf(schema.externalShape, () => preconditions_1.identity)
    .end()));
exports.fromSchema = fromSchema;
const wrapOptional = (s, ch) => (s.optional === true) ? (0, preconditions_1.optional)(ch) : ch;
const addCustom = (c, s, ch) => (0, preconditions_1.and)(ch, (0, spec_1.specs2Checks)(c.providers)(s.$checks || []));
const fromObject = (c) => ({ properties, $checks }) => (0, preconditions_1.every)(records.isRecord, records.union((0, record_1.map)(properties, (0, exports.fromSchema)(c))), (0, spec_1.specs2Checks)(c.providers)($checks || []));
const fromMap = (c) => ({ additionalProperties, $checks }) => (0, preconditions_1.every)(records.isRecord, records.map((0, exports.fromSchema)(c)(additionalProperties)), (0, spec_1.specs2Checks)(c.providers)($checks || []));
const fromMapObject = (c) => ({ properties, additionalProperties, $checks }) => (0, preconditions_1.and)(records.isRecord, (0, preconditions_1.and)(records.union((0, record_1.map)(properties, (0, exports.fromSchema)(c))), (0, preconditions_1.and)(records.map((0, exports.fromSchema)(c)(additionalProperties)), (0, spec_1.specs2Checks)(c.providers)($checks || []))));
const fromArray = (c) => ({ items }) => (0, preconditions_1.every)(arrays.isArray, arrays.map((0, exports.fromSchema)(c)(items)), arrays.map((0, spec_1.specs2Checks)(c.providers)(items.$checks || [])));
const fromTuple = (c) => ({ items }) => (0, preconditions_1.every)(arrays.isArray, arrays.tuple(items.map((0, exports.fromSchema)(c))));
const fromSum = (c) => ({ variants }) => (0, record_1.reduce)((0, record_1.map)(variants, (0, exports.fromSchema)(c)), (0, preconditions_1.reject)(''), preconditions_1.or);
const fromRef = (c) => ({ ref }) => refPrec(c)(ref);
const refPrec = (c) => (p) => (v) => c.checks.hasOwnProperty(p) ?
    c.checks[p](v) :
    (0, result_1.fail)(`unknown ref "${p}" known: ${(0, record_1.keys)(c.checks)}`, v);
//# sourceMappingURL=index.js.map