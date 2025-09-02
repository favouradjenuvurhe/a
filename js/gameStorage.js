// gameStorage.js

const STORAGE_KEY = "quicklife_save";

// Save game state
function saveGame() {
    try {
        const gameState = {
            player: window.player || {},
            stats: window.stats || {},
            money: document.getElementById("total-money")?.innerText || "0 $",
            story: document.getElementById("text-container")?.innerHTML || "",
            age: window.age || 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (err) {
        console.error("Failed to save game:", err);
    }
}

// Load game state
function loadGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const gameState = JSON.parse(saved);

        // restore player data
        window.player = gameState.player || {};
        window.stats = gameState.stats || {};
        window.age = gameState.age || 0;

        // restore UI
        document.getElementById("total-money").innerText = gameState.money || "0 $";
        document.getElementById("text-container").innerHTML = gameState.story || "";

        // ✅ Hide character creation if a saved game exists
        const createScreen = document.getElementById("create-character-screen");
        if (createScreen) {
            createScreen.style.display = "none";
        }

        // ✅ Make sure stats bars & game UI are updated
        if (typeof updateStatsUI === "function") {
            updateStatsUI(window.stats);
        }

        console.log("Game loaded from localStorage and resumed.");
    } catch (err) {
        console.error("Failed to load game:", err);
    }
}

// Clear save (when starting new life)
function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
}

// 🔄 Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Load game automatically on page load
window.addEventListener("load", loadGame);

// Hook into death / new life
window.newLife = (function(originalNewLife) {
    return function() {
        clearSave(); // clear storage when starting new life
        const createScreen = document.getElementById("create-character-screen");
        if (createScreen) {
            createScreen.style.display = "block"; // show again for new life
        }
        if (typeof originalNewLife === "function") {
            originalNewLife();
        }
    };
})(window.newLife);
