// Integration test: loads the real stats.js + menu.js into a VM with a
// stubbed DOM and in-memory localStorage, then drives showRunStats() the
// way showResults() does after a finished run.
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function makeElement() {
    const classes = new Set();
    return {
        innerText: "",
        innerHTML: "",
        style: {},
        childNodes: [{ nodeValue: "" }],
        firstElementChild: { style: {}, innerText: "" },
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c)
        },
        setAttribute() {},
        getAttribute() { return ""; },
        appendChild() {}
    };
}

function makeContext() {
    const elements = {};
    const storage = {};
    const context = {
        document: {
            getElementById: (id) => (elements[id] = elements[id] || makeElement()),
            getElementsByTagName: () => [makeElement()],
            getElementsByName: () => [makeElement()],
            getElementsByClassName: () => [makeElement()],
            querySelector: () => makeElement(),
            createElement: () => makeElement(),
            title: ""
        },
        localStorage: {
            getItem: (k) => (k in storage ? storage[k] : null),
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: (k) => { delete storage[k]; }
        },
        Audio: function () {
            this.preload = "";
            this.load = function () {};
            this.cloneNode = function () { return { volume: 0, play() {} }; };
        },
        window: { scrollTo() {}, history: { pushState() {}, replaceState() {}, back() {} } },
        navigator: { userAgent: "test" },
        location: { search: "", protocol: "http:", host: "test", pathname: "/" },
        XMLHttpRequest: function () { this.open = function () {}; this.send = function () {}; },
        alert() {},
        setTimeout: (fn) => fn(),
        setInterval: () => 0,
        clearInterval() {}
    };
    context.elements = elements;
    vm.createContext(context);
    for (const file of ["stats.js", "menu.js", "game.js"]) {
        const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
        vm.runInContext(src, context, { filename: file });
    }
    return context;
}

test("showRunStats renders the run's stats on the results screen", function () {
    const ctx = makeContext();
    vm.runInContext(`
        gameMode = "time"; gameGoal = 30;
        speedFactor = 100; minSizeFactor = 30; maxSizeFactor = 230; health = 100; shots = 3;
        statShots = 20; statHits = 15; statDamage = 600; statBestShot = 87; hits1 = 5;
        showRunStats();
    `, ctx);
    assert.strictEqual(ctx.elements["results_stat_targets"].innerText, 5);
    assert.strictEqual(ctx.elements["results_stat_accuracy"].innerText, "75%");
    assert.strictEqual(ctx.elements["results_stat_avg"].innerText, 40);
    assert.strictEqual(ctx.elements["results_stat_best"].innerText, 87);
});

test("first run sets a personal best, a worse second run shows the standing record", function () {
    const ctx = makeContext();
    vm.runInContext(`
        gameMode = "time"; gameGoal = 30;
        speedFactor = 100; minSizeFactor = 30; maxSizeFactor = 230; health = 100; shots = 3;
        statShots = 10; statHits = 10; statDamage = 400; statBestShot = 80;
        hits1 = 14; targetsGone = 0;
        showRunStats();
    `, ctx);
    const record = ctx.elements["results_record"];
    assert.strictEqual(record.innerText, "New personal best!");
    assert.strictEqual(record.classList.contains("record"), true);

    vm.runInContext(`hits1 = 9; showRunStats();`, ctx);
    assert.strictEqual(record.innerText, "Personal best: 14");
    assert.strictEqual(record.classList.contains("record"), false);
});

test("a better second run reports the previous best it displaced", function () {
    const ctx = makeContext();
    vm.runInContext(`
        gameMode = "time"; gameGoal = 30;
        speedFactor = 100; minSizeFactor = 30; maxSizeFactor = 230; health = 100; shots = 3;
        statShots = 10; statHits = 10; statDamage = 400; statBestShot = 80;
        hits1 = 8; targetsGone = 0;
        showRunStats();
        hits1 = 12;
        showRunStats();
    `, ctx);
    const record = ctx.elements["results_record"];
    assert.strictEqual(record.innerText, "New personal best! (previous: 8)");
    assert.strictEqual(record.classList.contains("record"), true);
});

test("score mode records the fastest completion time in seconds", function () {
    const ctx = makeContext();
    vm.runInContext(`
        gameMode = "score"; gameGoal = 15;
        speedFactor = 100; minSizeFactor = 30; maxSizeFactor = 230; health = 100; shots = 3;
        statShots = 15; statHits = 15; statDamage = 900; statBestShot = 90;
        hits1 = 15; targetsGone = 0;
        time = 123;
        showRunStats();
        time = 234;
        showRunStats();
    `, ctx);
    const record = ctx.elements["results_record"];
    assert.strictEqual(record.innerText, "Personal best: 12.3 s");
});

test("different settings keep separate personal bests", function () {
    const ctx = makeContext();
    vm.runInContext(`
        gameMode = "time"; gameGoal = 30;
        speedFactor = 100; minSizeFactor = 30; maxSizeFactor = 230; health = 100; shots = 3;
        statShots = 10; statHits = 10; statDamage = 400; statBestShot = 80;
        hits1 = 20; targetsGone = 0;
        showRunStats();
        speedFactor = 200; hits1 = 4;
        showRunStats();
    `, ctx);
    const record = ctx.elements["results_record"];
    assert.strictEqual(record.innerText, "New personal best!");
});
