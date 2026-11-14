# base-city-improvement-rules

City improvement mechanics for a ruleset to wrap with its own ids, numbers and improvements. A library: it has no entry
point and registers nothing.

- `lib/build`: `notBuiltRule(id)`, an improvement is built once a city; `siteRule(id, Improvement, site)`, only where
  the map allows (a Hydro Plant's mountains, a Harbour's coast); `buildRulesFor(entry)` and `deriveBuildRules(…)`, the
  `Build` rule of a `core-requirement` entry (`requires` an advance known or an improvement in the city, `excludedBy`
  improvements in the city).
- `lib/city`: `firstCapitalRule(Capital)`, a player's only city gets the capital; `destroyedWithCityRule()`, a destroyed
  city's improvements go with it; `isOnlyCity`.
- `lib/created`: `createdRules(…, { Capital })`, a new improvement is registered, a new capital destroys its player's
  old one, and `city-improvement:created` is emitted.
- `lib/maintenance`: `maintenanceRules(table, …, { criteria })`, a `Cost` rule a row, in a yield that carries the
  improvement.
- `lib/obsolete`: `obsoleteRules(table, …, { removed })`, discovering an advance removes the player's improvements of a
  type (`city-improvement:obsolete`), with a callback for a ruleset that refunds them.
- `lib/threat`: `isThreatened(city, …)`, an unfriendly unit or city nearby.
- `lib/buildPriority`: `buildPriorityRules(idPrefix, table, yields, upkeep, …)`, a computer player's rules of thumb for
  which improvement a city builds.
- `lib/has`: `hasImprovement`, `improvementOf`.

Given civ1-city-improvement's own inputs, the factories make the rules it registers today (`tests/civ1Pin.test.ts`,
pinned to a dump of its rules), so it can adopt them without anything moving.
