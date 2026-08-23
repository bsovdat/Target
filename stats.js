// Pure run-statistics and personal-best logic. Loaded in the browser as
// plain globals and by the Node test runner via module.exports.

function computeRunStats(raw) {
    return {
        targetsDestroyed: raw.targetsDestroyed,
        accuracyPct: raw.shotsFired > 0 ? Math.round((100 * raw.hitsOnTarget) / raw.shotsFired) : 0,
        avgDamage: raw.hitsOnTarget > 0 ? Math.round(raw.damageDealt / raw.hitsOnTarget) : 0,
        bestShotDamage: raw.bestShotDamage
    };
}

function personalBestKey(settings) {
    return [
        "tarca_pb",
        settings.gameMode,
        settings.gameGoal,
        settings.speedFactor,
        settings.minSizeFactor,
        settings.maxSizeFactor,
        settings.health,
        settings.shots,
        settings.missPenalty
    ].join("|");
}

// result: time mode = final score (higher is better),
//         score mode = elapsed time in tenths of a second (lower is better).
function evaluatePersonalBest(previousBest, result, gameMode) {
    if (previousBest === null || previousBest === undefined || isNaN(previousBest)) {
        return { isRecord: true, best: result };
    }
    var beaten = gameMode === "score" ? result < previousBest : result > previousBest;
    return beaten ? { isRecord: true, best: result } : { isRecord: false, best: previousBest };
}

function formatResult(value, gameMode) {
    if (gameMode === "score") {
        return (Math.round(value) / 10).toFixed(1) + " s";
    }
    return String(value);
}

// Browser-only glue: localStorage can be unavailable (e.g. private mode).
function loadPersonalBest(key) {
    try {
        var stored = localStorage.getItem(key);
        return stored === null ? null : parseFloat(stored);
    } catch (e) {
        return null;
    }
}

function savePersonalBest(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {}
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        computeRunStats: computeRunStats,
        personalBestKey: personalBestKey,
        evaluatePersonalBest: evaluatePersonalBest,
        formatResult: formatResult
    };
}
