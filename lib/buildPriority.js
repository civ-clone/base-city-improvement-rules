"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPriorityRules = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const BuildPriority_1 = require("@civ-clone/core-city-build/Rules/BuildPriority");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const has_1 = require("./has");
const threat_1 = require("./threat");
const total = (yields, YieldType) => yields
    .filter((cityYield) => cityYield instanceof YieldType)
    .reduce((sum, cityYield) => sum + cityYield.value(), 0);
/**
 * A computer player's rules of thumb for which improvement a city builds (`BuildPriority`, ids
 * `<idPrefix>:city/build-priority/<Improvement>`): each of `needs` scaled by how affordable its `upkeep` is (half as
 * needed when it would cost all the city makes in gold); each of `withFactory`, only with a factory; each of `forWar`,
 * only under threat.
 */
const buildPriorityRules = (idPrefix, { needs, everydayImprovements, everyday, withFactory, factories, forWar, warPriority, }, { Corruption, Food, Gold, Luxuries, Production, Research, Unhappiness, }, upkeep, { cityGrowthRegistry = CityGrowthRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, interactionRegistry = InteractionRegistry_1.instance, cityRegistry = CityRegistry_1.instance, unitRegistry = UnitRegistry_1.instance, } = {}) => {
    const cityNeeds = (city, yields) => ({
        city,
        // Corruption yields are negative: what the city loses.
        corruption: -total(yields, Corruption),
        food: total(yields, Food),
        gold: total(yields, Gold),
        luxuries: total(yields, Luxuries),
        production: total(yields, Production),
        research: total(yields, Research),
        size: cityGrowthRegistry.getByCity(city).size(),
        unhappy: total(yields, Unhappiness),
    }), affordable = (Item, city, gold) => (1 + Math.max(0, gold)) /
        (1 + Math.max(0, gold) + upkeep(Item, city.player())), hasFactory = (city) => factories.some((Factory) => (0, has_1.hasImprovement)(city, Factory, cityImprovementRegistry)), isItem = (Item) => (cityBuild, BuildItem) => BuildItem === Item, id = (Item) => `${idPrefix}:city/build-priority/${Item.name}`;
    return [
        ...needs.map(([Item, need]) => new BuildPriority_1.default(id(Item), new Criterion_1.default(isItem(Item)), new Effect_1.default((cityBuild, BuildItem, yields) => {
            const needs = cityNeeds(cityBuild.city(), yields);
            return (Math.max(need(needs), everydayImprovements.includes(Item) ? everyday : 0) * affordable(Item, needs.city, needs.gold));
        }))),
        ...withFactory.map(([Item, share]) => new BuildPriority_1.default(id(Item), new Criterion_1.default(isItem(Item)), new Criterion_1.default((cityBuild) => hasFactory(cityBuild.city())), new Effect_1.default((cityBuild, BuildItem, yields) => {
            const needs = cityNeeds(cityBuild.city(), yields);
            return (needs.production *
                share *
                affordable(Item, needs.city, needs.gold));
        }))),
        ...forWar.map((Item) => new BuildPriority_1.default(id(Item), new Criterion_1.default(isItem(Item)), new Criterion_1.default((cityBuild) => (0, threat_1.default)(cityBuild.city(), cityRegistry, interactionRegistry, unitRegistry)), new Effect_1.default(() => warPriority))),
    ];
};
exports.buildPriorityRules = buildPriorityRules;
exports.default = exports.buildPriorityRules;
//# sourceMappingURL=buildPriority.js.map