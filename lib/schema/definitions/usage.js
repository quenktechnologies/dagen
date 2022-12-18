"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = exports.evalUsages = exports.evalUsage = exports.isRef = exports.SYMBOL = void 0;
const match_1 = require("@quenk/noni/lib/control/match");
const record_1 = require("@quenk/noni/lib/data/record");
const result_1 = require("@quenk/preconditions/lib/result");
const record_2 = require("@quenk/preconditions/lib/record");
const __1 = require("../");
exports.SYMBOL = '#';
/**
 * isRef indicates whether a schema is a reference or not.
 */
const isRef = (s) => (0, record_1.isRecord)(s) &&
    (typeof s['type'] === 'string') &&
    (s['type'][0] === exports.SYMBOL);
exports.isRef = isRef;
/**
 * evalUsage evaluates a string against a definition.
 *
 * If the string cannot be resolved to a defintion it results in a Failure.
 */
const evalUsage = (definitions) => (def) => definitions.hasOwnProperty(def) ?
    (0, result_1.succeed)(definitions[def]) :
    (0, result_1.fail)('unknown', def, { definitions });
exports.evalUsage = evalUsage;
/**
 * evalUsages transforms a Usages into a Definitions.
 *
 * If any of the members of the Usages map refer to an
 * unknown definition the whole evaluation fails.
 */
const evalUsages = (defs) => (work) => (0, record_2.map)((0, exports.evalUsage)(defs))(work);
exports.evalUsages = evalUsages;
/**
 * pull extracts all the supported usages of definition references in
 * a Schema into a map.
 *
 * The key is the path extracted and the value is the definition name
 * name as it appears in the definitions section.
 */
const pull = (work) => (path) => (schema) => (0, match_1.match)(schema)
    .caseOf({ type: __1.TYPE_OBJECT }, pullObject(work)(path))
    .caseOf({ type: __1.TYPE_ARRAY }, pullArray(work)(path))
    .caseOf({ type: __1.TYPE_SUM }, pullSum(work)(path))
    .orElse(pullOther(work)(path))
    .end();
exports.pull = pull;
const pullObject = (work) => (path) => (schema) => {
    let props = (0, record_1.isRecord)(schema.properties) ?
        pullProperties(work)(path)(schema.properties) : {};
    let adds = hasPullableAdditionalRefs(schema) ?
        pullAdditional(work)(path)(schema.additionalProperties) : {};
    return (0, record_1.merge)(work, (0, record_1.merge)(props, adds));
};
const pullProperties = (work) => (path) => (properties) => (0, record_1.reduce)(properties, work, (p, c, k) => (0, exports.pull)(p)(join(path, 'properties', k))(c));
const pullAdditional = (work) => (path) => (additional) => (0, record_1.merge)(work, { [join(path, 'additionalProperties')]: snip(additional) });
const hasPullableAdditionalRefs = (schema) => ((0, record_1.isRecord)(schema.additionalProperties) &&
    (0, exports.isRef)(schema.additionalProperties));
const pullArray = (work) => (path) => (schema) => (0, exports.isRef)(schema.items) ?
    (0, record_1.merge)(work, { [join(path, 'items')]: snip(schema.items) }) :
    work;
const pullSum = (work) => (path) => (schema) => (0, record_1.reduce)(schema.variants, work, (p, c, k) => (0, exports.pull)(p)(join(path, 'variants', k))(c));
const pullOther = (work) => (path) => (schema) => (0, exports.isRef)(schema) ? (0, record_1.merge)(work, { [path]: snip(schema) }) : work;
const snip = (schema) => schema.type.slice(1);
const join = (...k) => k.filter(x => x).join('.');
//# sourceMappingURL=usage.js.map