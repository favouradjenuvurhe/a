// gameStorage.js
"use strict";

const STORAGE_KEY = "quicklife_save";

/**
 * Helper: revive a plain object back into a Person instance
 */
function revivePerson(obj) {
    if (!obj) return null;
    const p = Object.assign(new Person(), obj);

    // Re-wrap nested objects (so methods & defaults remain intact)
    p.inventory = { ...p.inventory };
    p.stats = { ...p.stats };
    p.relationships = { ...p.relationships };
    p.skills = { ...p.skills };
    p.freetime = { ...p.freetime };
    p.money = { ...p.money };
    p.criminalRecord = { ...p.criminalRecord };
    p.prison = { ...p.prison };
    p.actions = { ...p.actions };
    p.socialMedia = { ...p.socialMedia };

    return p;
}

/**
 * Save game state (deep save)
 */
function saveGame() {
    try {
        const gameState = {
            player: window.player || null,
            characters: window.characters || [],
            year: window.year || 0,
            age: window.age || 0,

            // UI & progress
            story: document.getElementById("text-container")?.innerHTML || "",
            moneyText: document.getElementById("total-money")?.innerText || "0 $",

            // Menus / screen states
            createScreenVisible: document.getElementById("create-character-screen")?.style.display !== "none"
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        // console.log("Game saved.");
    } catch (err) {
        console.error("Failed to save game:", err);
    }
}

/**
 * Load game state (deep restore)
 */
function loadGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const gameState = JSON.parse(saved);

        // revive player
        window.player = gameState.player ? revivePerson(gameState.player) : null;

        // revive characters
        window.characters = Array.isArray(gameState.characters)
            ? gameState.characters.map(c => revivePerson(c))
            : [];

        window.year = gameState.year || 0;
        window.age = gameState.age || 0;

        // restore UI
        document.getElementById("text-container").innerHTML = gameState.story || "";
        document.getElementById("total-money").innerText =
            player?.money?.total ? `${player.money.total} $` : gameState.moneyText || "0 $";

        // show/hide create screen
        const createScreen = document.getElementById("create-character-screen");
        if (createScreen) {
            createScreen.style.display = gameState.createScreenVisible ? "block" : "none";
        }

        // refresh UI systems
        if (typeof handleStatBars === "function") handleStatBars(player, true);
        if (typeof lifeStageDisplayer === "function") lifeStageDisplayer();
        if (typeof moneyViewer === "function") moneyViewer();
        if (typeof jobAssigner === "function") jobAssigner(window.characters);

        console.log("✅ Game fully loaded and resumed.");
    } catch (err) {
        console.error("Failed to load game:", err);
    }
}

/**
 * Clear save (new life / death)
 */
function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Auto-save every 5 seconds
 */
setInterval(saveGame, 5000);

/**
 * Load game automatically on page load
 */
window.addEventListener("load", loadGame);

/**
 * Hook into death / new life
 */
window.newLife = (function (originalNewLife) {
    return function () {
        clearSave(); // wipe save on new life
        const createScreen = document.getElementById("create-character-screen");
        if (createScreen) {
            createScreen.style.display = "block";
        }
        if (typeof originalNewLife === "function") {
            originalNewLife();
        }
    };
})(window.newLife);
