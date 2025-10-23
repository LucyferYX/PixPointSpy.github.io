// Load statistics
function loadStats() {
    const saved = localStorage.getItem('pixPointSpyTopScores');
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

// Format time as minutes : seconds
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Show statistics on a table
function renderStats() {
    const statsText = document.getElementById('statsText');
    const scores = loadStats();

    const t = translations[currentLang]; // shorthand

    if (scores.length === 0) {
        statsText.textContent = t.stats_empty;
        return;
    }

    let html = `
        <table class="table table-striped table-bordered mt-3">
            <thead>
                <tr>
                    <th>${t.table_rank}</th>
                    <th>${t.table_date}</th>
                    <th>${t.table_level}</th>
                    <th>${t.table_mistakes}</th>
                    <th>${t.table_hints}</th>
                    <th>${t.table_time}</th>
                    <th>${t.table_score}</th>
                </tr>
            </thead>
            <tbody>
    `;

    scores.forEach((s, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${s.date}</td>
                <td>${s.level}</td>
                <td>${s.wrong}</td>
                <td>${s.hints}</td>
                <td>${formatTime(s.time)}</td>
                <td><strong>${s.score}</strong></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    statsText.innerHTML = html;
}

// Reset all scores
function resetStats() {
    localStorage.removeItem('pixPointSpyTopScores');
    renderStats();
}

document.getElementById('resetStatsBtn').addEventListener('click', resetStats);
window.addEventListener('DOMContentLoaded', renderStats);
