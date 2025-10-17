function loadStats() {
    const saved = localStorage.getItem('pixPointSpyStats');
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

function renderStats() {
    const statsText = document.getElementById('statsText');
    const stats = loadStats();

    if (!stats) {
        statsText.textContent = "No game data yet. Play a few rounds to see your stats here!";
        return;
    }

    const { correctCount = 0, wrongCount = 0, currentLevel = 1 } = stats;
    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    statsText.innerHTML = `
        <strong>Current Level:</strong> ${currentLevel}<br>
        <strong>Correct Guesses:</strong> ${correctCount}<br>
        <strong>Wrong Guesses:</strong> ${wrongCount}<br>
        <strong>Accuracy:</strong> ${accuracy}%
    `;
}

function resetStats() {
    localStorage.removeItem('pixPointSpyStats');
    renderStats();
}

document.getElementById('resetStatsBtn').addEventListener('click', resetStats);
window.addEventListener('DOMContentLoaded', renderStats);
