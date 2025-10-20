function loadStats() {
    const saved = localStorage.getItem('pixPointSpyTopScores');
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

function renderStats() {
    const statsText = document.getElementById('statsText');
    const scores = loadStats();

    if (scores.length === 0) {
        statsText.textContent = "No completed games yet. Play a few rounds to start your leaderboard!";
        return;
    }

    let html = `
        <table class="table table-striped table-bordered mt-3">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Level</th>
                    <th>Wrong</th>
                    <th>Hints</th>
                    <th>Time (s)</th>
                    <th>Score</th>
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
                <td>${s.time}</td>
                <td><strong>${s.score}</strong></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    statsText.innerHTML = html;
}


function resetStats() {
    localStorage.removeItem('pixPointSpyTopScores');
    renderStats();
}

document.getElementById('resetStatsBtn').addEventListener('click', resetStats);
window.addEventListener('DOMContentLoaded', renderStats);
