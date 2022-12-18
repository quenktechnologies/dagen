"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spec2Check = exports.specs2Checks = void 0;
const preconditions_1 = require("@quenk/preconditions");
/**
 * specs2Checks converts an array of specs into a Check chain.
 */
const specs2Checks = (p) => (specs) => (specs.length > 0) ?
    preconditions_1.every.apply(null, specs.map((0, exports.spec2Check)(p))) :
    preconditions_1.identity;
exports.specs2Checks = specs2Checks;
/**
 * spec2Check converts a Spec to a Check using the spec name.
 *
 * If the name is not found the identity Check is used.
 */
const spec2Check = (providers) => (s) => providers.hasOwnProperty(s.name) ?
    providers[s.name].apply(null, Array.isArray(s.parameters) ?
        s.parameters :
        []) :
    preconditions_1.identity;
exports.spec2Check = spec2Check;
//# sourceMappingURL=spec.js.map