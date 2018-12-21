"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const match_1 = require("@quenk/noni/lib/control/match");
const record_1 = require("@quenk/noni/lib/data/record");
const result_1 = require("@quenk/preconditions/lib/result");
const record_2 = require("@quenk/preconditions/lib/record");
const __1 = require("../");
exports.SYMBOL = '#';
/**
 * isRef indicates whether a schema is a reference or not.
 */
exports.isRef = (s) => record_1.isRecord(s) &&
    (typeof s['type'] === 'string') &&
    (s['type'][0] === exports.SYMBOL);
/**
 * evalUsage evaluates a string against a definition.
 *
 * If the string cannot be resolved to a defintion it results in a Failure.
 */
exports.evalUsage = (definitions) => (def) => definitions.hasOwnProperty(def) ?
    result_1.succeed(definitions[def]) :
    result_1.fail('unknown', def, { definitions });
/**
 * evalUsages transforms a Usages into a Definitions.
 *
 * If any of the members of the Usages map refer to an
 * unknown definition the whole evaluation fails.
 */
exports.evalUsages = (defs) => (work) => record_2.map(exports.evalUsage(defs))(work);
/**
 * pull extracts all the supported usages of definition references in
 * a Schema into a map.
 *
 * The key is the path extracted and the value is the definition name
 * name as it appears in the definitions section.
 */
exports.pull = (work) => (path) => (schema) => match_1.match(schema)
    .caseOf({ type: __1.TYPE_OBJECT }, pullObject(work)(path))
    .caseOf({ type: __1.TYPE_ARRAY }, pullArray(work)(path))
    .caseOf({ type: __1.TYPE_SUM }, pullSum(work)(path))
    .orElse(pullOther(work)(path))
    .end();
const pullObject = (work) => (path) => (schema) => {
    let props = record_1.isRecord(schema.properties) ?
        pullProperties(work)(path)(schema.properties) : {};
    let adds = hasPullableAdditionalRefs(schema) ?
        pullAdditional(work)(path)(schema.additionalProperties) : {};
    return record_1.merge(work, record_1.merge(props, adds));
};
const pullProperties = (work) => (path) => (properties) => record_1.reduce(properties, work, (p, c, k) => exports.pull(p)(join(path, 'properties', k))(c));
const pullAdditional = (work) => (path) => (additional) => record_1.merge(work, { [join(path, 'additionalProperties')]: snip(additional) });
const hasPullableAdditionalRefs = (schema) => (record_1.isRecord(schema.additionalProperties) &&
    exports.isRef(schema.additionalProperties));
const pullArray = (work) => (path) => (schema) => exports.isRef(schema.items) ?
    record_1.merge(work, { [join(path, 'items')]: snip(schema.items) }) :
    work;
const pullSum = (work) => (path) => (schema) => record_1.reduce(schema.variants, work, (p, c, k) => exports.pull(p)(join(path, 'variants', k))(c));
const pullOther = (work) => (path) => (schema) => exports.isRef(schema) ? record_1.merge(work, { [path]: snip(schema) }) : work;
const snip = (schema) => schema.type.slice(1);
const join = (...k) => k.filter(x => x).join('.');
//# sourceMappingURL=usage.js.map