"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preconditions_1 = require("@quenk/preconditions");
/**
 * specs2Checks converts an array of specs into a Check chain.
 */
exports.specs2Checks = (p) => (specs) => (specs.length > 0) ?
    preconditions_1.every.apply(null, specs.map(exports.spec2Check(p))) :
    preconditions_1.identity;
/**
 * spec2Check converts a Spec to a Check using the spec name.
 *
 * If the name is not found the identity Check is used.
 */
exports.spec2Check = (providers) => (s) => providers.hasOwnProperty(s.name) ?
    providers[s.name].apply(null, Array.isArray(s.parameters) ?
        s.parameters :
        []) :
    preconditions_1.identity;
//# sourceMappingURL=spec.js.map