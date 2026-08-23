const { test } = require("node:test");
const assert = require("node:assert");

const {
    computeRunStats,
    personalBestKey,
    evaluatePersonalBest,
    formatResult
} = require("../stats.js");

test("computeRunStats derives accuracy, avg damage and best shot", function () {
    const stats = computeRunStats({
        shotsFired: 20,
        hitsOnTarget: 15,
        damageDealt: 600,
        bestShotDamage: 87,
        targetsDestroyed: 5
    });
    assert.strictEqual(stats.targetsDestroyed, 5);
    assert.strictEqual(stats.accuracyPct, 75);
    assert.strictEqual(stats.avgDamage, 40);
    assert.strictEqual(stats.bestShotDamage, 87);
});

test("computeRunStats rounds accuracy and avg damage to whole numbers", function () {
    const stats = computeRunStats({
        shotsFired: 3,
        hitsOnTarget: 2,
        damageDealt: 101,
        bestShotDamage: 60,
        targetsDestroyed: 1
    });
    assert.strictEqual(stats.accuracyPct, 67);
    assert.strictEqual(stats.avgDamage, 51);
});

test("computeRunStats handles a run with no shots at all", function () {
    const stats = computeRunStats({
        shotsFired: 0,
        hitsOnTarget: 0,
        damageDealt: 0,
        bestShotDamage: 0,
        targetsDestroyed: 0
    });
    assert.strictEqual(stats.accuracyPct, 0);
    assert.strictEqual(stats.avgDamage, 0);
    assert.strictEqual(stats.bestShotDamage, 0);
});

test("computeRunStats handles shots fired but none on target", function () {
    const stats = computeRunStats({
        shotsFired: 8,
        hitsOnTarget: 0,
        damageDealt: 0,
        bestShotDamage: 0,
        targetsDestroyed: 0
    });
    assert.strictEqual(stats.accuracyPct, 0);
    assert.strictEqual(stats.avgDamage, 0);
});

test("personalBestKey includes every setting that changes difficulty", function () {
    const base = {
        gameMode: "time",
        gameGoal: 30,
        speedFactor: 100,
        minSizeFactor: 30,
        maxSizeFactor: 230,
        health: 100,
        shots: 3,
        missPenalty: -1
    };
    const key = personalBestKey(base);
    assert.strictEqual(typeof key, "string");

    // Any single setting change must produce a different key.
    const variants = [
        { gameMode: "score" },
        { gameGoal: 15 },
        { speedFactor: 150 },
        { minSizeFactor: 20 },
        { maxSizeFactor: 80 },
        { health: 50 },
        { shots: 0 },
        { missPenalty: -3 }
    ];
    variants.forEach(function (change) {
        const other = personalBestKey(Object.assign({}, base, change));
        assert.notStrictEqual(other, key, JSON.stringify(change));
    });

    // Same settings, same key.
    assert.strictEqual(personalBestKey(Object.assign({}, base)), key);
});

test("time mode: higher score beats the previous best", function () {
    assert.deepStrictEqual(evaluatePersonalBest(10, 14, "time"), { isRecord: true, best: 14 });
    assert.deepStrictEqual(evaluatePersonalBest(10, 7, "time"), { isRecord: false, best: 10 });
    assert.deepStrictEqual(evaluatePersonalBest(10, 10, "time"), { isRecord: false, best: 10 });
});

test("time mode: negative scores still compare correctly", function () {
    assert.deepStrictEqual(evaluatePersonalBest(-6, -2, "time"), { isRecord: true, best: -2 });
    assert.deepStrictEqual(evaluatePersonalBest(-2, -6, "time"), { isRecord: false, best: -2 });
});

test("score mode: lower time (in tenths) beats the previous best", function () {
    assert.deepStrictEqual(evaluatePersonalBest(123, 98, "score"), { isRecord: true, best: 98 });
    assert.deepStrictEqual(evaluatePersonalBest(98, 123, "score"), { isRecord: false, best: 98 });
    assert.deepStrictEqual(evaluatePersonalBest(98, 98, "score"), { isRecord: false, best: 98 });
});

test("first run ever is always a record", function () {
    assert.deepStrictEqual(evaluatePersonalBest(null, 5, "time"), { isRecord: true, best: 5 });
    assert.deepStrictEqual(evaluatePersonalBest(null, 123, "score"), { isRecord: true, best: 123 });
});

test("formatResult renders time-mode results as points and score-mode results as seconds", function () {
    assert.strictEqual(formatResult(14, "time"), "14");
    assert.strictEqual(formatResult(-3, "time"), "-3");
    // score-mode values are stored in tenths of a second
    assert.strictEqual(formatResult(123, "score"), "12.3 s");
    assert.strictEqual(formatResult(120, "score"), "12.0 s");
});
