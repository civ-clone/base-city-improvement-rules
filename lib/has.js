"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.improvementOf = exports.hasImprovement = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
/** Whether `city` has a standing improvement of `Improvement` (or a subclass of it). */
const hasImprovement = (city, Improvement, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry
    .getByCity(city)
    .some((cityImprovement) => cityImprovement instanceof Improvement);
exports.hasImprovement = hasImprovement;
/** The first of `city`'s standing improvements of `Improvement`, or `null`. */
const improvementOf = (city, Improvement, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    var _a;
    return (_a = cityImprovementRegistry
        .getByCity(city)
        .find((cityImprovement) => cityImprovement instanceof Improvement)) !== null && _a !== void 0 ? _a : null;
};
exports.improvementOf = improvementOf;
exports.default = exports.hasImprovement;
//# sourceMappingURL=has.js.map