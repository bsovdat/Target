const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadGameContext() {
    const context = {
        window: { requestAnimationFrame() {} },
        document: {
            getElementById() { return {}; },
            getElementsByTagName() { return [{ style: {} }]; },
            querySelector() { return { setAttribute() {} }; }
        },
        setTimeout() {},
        setInterval() { return 0; },
        clearInterval() {},
        requestAnimationFrame() {},
        performance: { now() { return 0; } },
        Math: Math
    };
    vm.createContext(context);
    const source = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
    vm.runInContext(source, context, { filename: "game.js" });
    return context;
}

test("every shot consumes the per-target budget and exhaustion penalizes the score", function () {
    const ctx = loadGameContext();
    vm.runInContext(`
        counting = true;
        actif = true;
        mobile = false;
        shots = 3;
        shotsMade = 0;
        hits1 = 0;
        targetsGone = 0;
        statShots = 0;
        statHits = 0;
        statDamage = 0;
        statBestShot = 0;
        damage = 25;
        gameMode = "time";
        c = { offsetTop: 0, offsetLeft: 0 };
        ctx = {};
        shotsSign = { innerHTML: "3" };
        l_score = { childNodes: [{ nodeValue: 0 }] };
        t1 = {
            clicked: function () {
                shotsMade++;
                shotsSign.innerHTML = shots - shotsMade;
                return 2;
            },
            erase: function () {},
            new: function () {},
            draw: function () {}
        };

        onCanvasClick({ pageX: 10, pageY: 10 });
    `, ctx);
    assert.strictEqual(ctx.shotsMade, 1);
    assert.strictEqual(ctx.shotsSign.innerHTML, 2);
    assert.strictEqual(ctx.targetsGone, 0);

    vm.runInContext(`onCanvasClick({ pageX: 10, pageY: 10 });`, ctx);
    assert.strictEqual(ctx.shotsMade, 2);
    assert.strictEqual(ctx.shotsSign.innerHTML, 1);
    assert.strictEqual(ctx.targetsGone, 0);

    vm.runInContext(`onCanvasClick({ pageX: 10, pageY: 10 });`, ctx);
    assert.strictEqual(ctx.shotsMade, 0);
    assert.strictEqual(ctx.shotsSign.innerHTML, 3);
    assert.strictEqual(ctx.targetsGone, 1);
    assert.strictEqual(ctx.l_score.childNodes[0].nodeValue, -3);
});
