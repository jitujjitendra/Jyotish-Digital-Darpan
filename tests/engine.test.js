"use strict";

const assert = require("assert");
const engine = require("../astro-engine");

const kundli = engine.generateKundli({
  name: "Test Native",
  date: "1990-01-15",
  time: "08:30",
  place: "Delhi"
});

assert.strictEqual(kundli.name, "Test Native");
assert.ok(kundli.ascendant.sign);
assert.strictEqual(kundli.planets.length, 9);
assert.ok(kundli.planets.find(planet => planet.planet === "Moon").nakshatra);

const horoscope = engine.dailyHoroscope({
  sign: "Aries",
  date: "2026-06-04",
  place: "Delhi"
});

assert.strictEqual(horoscope.sign, "Aries");
assert.ok(horoscope.prediction.includes("Aries"));
assert.ok(!horoscope.prediction.includes("undefined"));
assert.ok(horoscope.remedy);

const panchang = engine.panchang({
  date: "2026-06-04",
  place: "Delhi"
});

assert.ok(panchang.tithi.name);
assert.ok(panchang.nakshatra.name);
assert.ok(panchang.sunrise);
assert.ok(panchang.rahuKaal);

const match = engine.matchmaking({
  person1: { name: "A", date: "1992-05-20", time: "10:10", place: "Delhi" },
  person2: { name: "B", date: "1994-08-18", time: "18:45", place: "Mumbai" }
});

assert.ok(match.ashtakoot.total >= 0);
assert.ok(match.ashtakoot.total <= 36);
assert.ok(match.guidance.length > 0);

const answer = engine.askAstrologer({
  sign: "Leo",
  question: "Meri career growth kab hogi?"
});

assert.strictEqual(answer.topic, "career");
assert.ok(answer.answer);

console.log("All local astrology engine tests passed.");
