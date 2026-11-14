"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const Cost_1 = require("@civ-clone/core-city/Rules/Cost");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const has_1 = require("./has");
/**
 * A city `Cost` rule for each row of `table`: a city with the improvement pays `cost` of the yield a turn, as a yield
 * that carries the improvement (so a treasury that can't pay can sell it). `criteria` are added to every rule, for a
 * ruleset whose upkeep is charged only sometimes; `cost` may be a function of the city, for upkeep that changes.
 */
const maintenanceRules = (table, { cityImprovementRegistry = CityImprovementRegistry_1.instance, } = {}, { criteria = [], idPrefix, } = {}) => table.map(([Improvement, YieldType, cost]) => new Cost_1.default(...(idPrefix === undefined
    ? []
    : [`${idPrefix}:city/cost/maintenance/${Improvement.name}`]), new Criterion_1.default((city) => (0, has_1.improvementOf)(city, Improvement, cityImprovementRegistry) !== null), ...criteria, new Effect_1.default((city) => new YieldType(typeof cost === 'function' ? cost(city) : cost, (0, has_1.improvementOf)(city, Improvement, cityImprovementRegistry)))));
exports.maintenanceRules = maintenanceRules;
exports.default = exports.maintenanceRules;
//# sourceMappingURL=maintenance.js.map