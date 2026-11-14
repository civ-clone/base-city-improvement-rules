"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyedWithCityRule = exports.firstCapitalRule = exports.isOnlyCity = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Created_1 = require("@civ-clone/core-city/Rules/Created");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Destroyed_1 = require("@civ-clone/core-city/Rules/Destroyed");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/** Whether `city` is its player's only city: none of the player's other cities is registered. */
const isOnlyCity = (city, cityRegistry = CityRegistry_1.instance) => cityRegistry
    .getByPlayer(city.player())
    .every((other) => other === city);
exports.isOnlyCity = isOnlyCity;
/**
 * A city `Created` rule: a player's only city gets `Capital`, built for free (its first city, or the first after
 * losing them all). It holds whether or not the new city is registered yet when the rule runs.
 */
const firstCapitalRule = (Capital, { cityRegistry = CityRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, } = {}, id) => new Created_1.default(...(id === undefined ? [] : [id]), new Criterion_1.default((city) => (0, exports.isOnlyCity)(city, cityRegistry)), new Effect_1.default((city) => cityImprovementRegistry.register(new Capital(city, ruleRegistry))));
exports.firstCapitalRule = firstCapitalRule;
/** A city `Destroyed` rule: the improvements of a destroyed city are destroyed with it. */
const destroyedWithCityRule = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, } = {}, id) => new Destroyed_1.default(...(id === undefined ? [] : [id]), new Criterion_1.default((city) => cityImprovementRegistry.getByCity(city).length > 0), new Effect_1.default((city) => cityImprovementRegistry
    .getByCity(city)
    .forEach((cityImprovement) => cityImprovement.destroy())));
exports.destroyedWithCityRule = destroyedWithCityRule;
//# sourceMappingURL=city.js.map