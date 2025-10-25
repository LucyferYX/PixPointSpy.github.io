let currentImageUrl = '';
let gridInfo = null;
let gameActive = false;
let lastClickTime = 0;
let alteredPixelData = null;

// Canvas size scaling
const MAX_CANVAS_WIDTH = 420;
const MAX_CANVAS_HEIGHT = 420;

// Fetched image size
const WIDTH = 640;
const HEIGHT = 480;

// Game statistics
let currentLevel = 1;
let pixelCount = 3;
let correctCount = 0;
let wrongCount = 0;
let hintCount = 0;
let startTime = 0;
let endTime = 0;


// Return a random Lorem Picsum image
function getRandomImageUrl() {
  const imgId = Math.floor(Math.random() * 1085);
  return `https://picsum.photos/id/${imgId}/${WIDTH}/${HEIGHT}`;
}


// Load image
async function loadAndPrepareImage(url = null, maxRetries = 5) {
    let attempts = 0;

    while (attempts < maxRetries) {
        attempts++;
        const finalUrl = url || getRandomImageUrl();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = finalUrl;

        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            console.log(`Image loaded successfully: ${finalUrl}`);
            return img;
        } catch (err) {
            console.warn(`Attempt ${attempts} failed for image: ${finalUrl}:`, err);
            if (attempts >= maxRetries) throw new Error("Image failed to load after multiple attempts");
            await new Promise(r => setTimeout(r, 300));
        }
    }
}


// Pixelating and drawing
function pixelateImage(img, pixelCount) {
    const smallW = pixelCount;
    const smallH = Math.round(pixelCount * (img.height / img.width));

    const smallCanvas = document.createElement('canvas');
    const ctx = smallCanvas.getContext('2d');
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;

    ctx.drawImage(img, 0, 0, smallW, smallH);
    const pixelData = ctx.getImageData(0, 0, smallW, smallH);

    return { pixelData, smallW, smallH };
}

function alterPixel(pixelData) {
    const data = new Uint8ClampedArray(pixelData.data);
    const width = pixelData.width;
    const height = pixelData.height;

    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const idx = (y * width + x) * 4;

    const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
    const delta = brightness < 128 ? 60 : -60;
    const channel = Math.floor(Math.random() * 3);

    data[idx + channel] = Math.max(0, Math.min(255, data[idx + channel] + delta));

    return {
        alteredData: new ImageData(data, width, height),
        changed_pixel: { x, y, w: width, h: height },
        debug: { x, y, channel, delta }
    };
}

function upscaleToCanvas(imageData, targetWidth, targetHeight) {
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = imageData.width;
    smallCanvas.height = imageData.height;
    smallCanvas.getContext('2d').putImageData(imageData, 0, 0);

    const bigCanvas = document.createElement('canvas');
    bigCanvas.width = targetWidth;
    bigCanvas.height = targetHeight;
    const ctx = bigCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(smallCanvas, 0, 0, targetWidth, targetHeight);

    return bigCanvas.toDataURL("image/png");
}

async function generateGameImages(pixelCount) {
    const img = await loadAndPrepareImage();

    const { pixelData, smallW, smallH } = pixelateImage(img, pixelCount);
    const { alteredData, changed_pixel, debug } = alterPixel(pixelData);

    const originalB64 = upscaleToCanvas(pixelData, img.width, img.height);
    const alteredB64 = upscaleToCanvas(alteredData, img.width, img.height);

    alteredPixelData = alteredData;

    return { original: originalB64, altered: alteredB64, changed_pixel, debug };
}

function drawImageToCanvas(canvasId, dataUrl) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
        const scale = Math.min(1, MAX_CANVAS_WIDTH / img.width, MAX_CANVAS_HEIGHT / img.height);

        let targetWidth = Math.round(img.width * scale);
        let targetHeight = Math.round(img.height * scale);

        if (gridInfo) {
            const cellW = Math.floor(targetWidth / gridInfo.w);
            const cellH = Math.floor(targetHeight / gridInfo.h);

            targetWidth = cellW * gridInfo.w;
            targetHeight = cellH * gridInfo.h;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.imageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.dataset.src = dataUrl;
    };

    img.src = dataUrl;
}


// Start or restart game
async function startGame() {
    gameActive = true;
    currentLevel = 1;
    pixelCount = 3;
    correctCount = 0;
    wrongCount = 0;
    hintCount = 0;
    startTime = Date.now();

    updateStatsCard();
    await nextLevel();
}


setInterval(() => {
    if (gameActive) {
        updateStatsCard();
    }
}, 1000);


// Move to the next level
async function nextLevel() {
    if (!gameActive) 
        return;

    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');

    try {
        const data = await generateGameImages(pixelCount);
        gridInfo = data.changed_pixel;

        drawImageToCanvas('canvasOriginal', data.original);
        drawImageToCanvas('canvasAltered', data.altered);
    } catch (err) {
        console.error(err.message);
        alert("An image failed to load, please try restarting the game.");
        gameActive = false;
    } finally {
        setTimeout(() => overlay.classList.remove('active'), 300);
    }
}


// Updating statistics live
function updateStatsCard() {
    const gridHeight = pixelCount;
    const gridWidth  = Math.floor((3 * gridHeight - 1) / 4);

    document.getElementById('levelCounter').textContent = currentLevel;
    document.getElementById('pixelCount').textContent = `${gridHeight} × ${gridWidth}`;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    document.getElementById('hintCount').textContent = hintCount;

    if (gameActive) {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const seconds = String(elapsedSec % 60).padStart(2, '0');
        document.getElementById('timeCounter').textContent = `${minutes}:${seconds}`;
    } else {
        const elapsedSec = Math.floor((endTime - startTime) / 1000);
        const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const seconds = String(elapsedSec % 60).padStart(2, '0');
        document.getElementById('timeCounter').textContent = `${minutes}:${seconds}`;
    }
}


// Handle user click on altered image
document.getElementById('canvasAltered').addEventListener('click', (e) => {
    if (!gridInfo || !gameActive)
        return;

    // Ignore clicking if it happens in less than 0.5 seconds after previous
    const now = Date.now();
    if (now - lastClickTime < 500) 
        return;

    lastClickTime = now;


    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;

    const clickedX = Math.floor(xClick / cellWidth);
    const clickedY = Math.floor(yClick / cellHeight);

    if (clickedX === gridInfo.x && clickedY === gridInfo.y) {
        playSound("correct");
        currentLevel++;
        pixelCount += 2;
        correctCount++;

        updateStatsCard();

        if (currentLevel == 100) {
            alert("Congratulations! You’ve completed all 100 levels! However, you can continue leveling up as long as you want!");
        }

        nextLevel();
    } else {
        playSound("wrong");
        wrongCount++;
        updateStatsCard();
    }
});


// Hover highlight
document.getElementById('canvasAltered').addEventListener('mousemove', (e) => {
    if (!gridInfo || !gameActive) 
        return;

    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const xHover = e.clientX - rect.left;
    const yHover = e.clientY - rect.top;

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;
    const hoverX = Math.floor(xHover / cellWidth);
    const hoverY = Math.floor(yHover / cellHeight);

    const img = new Image();
    img.src = canvas.dataset.src;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeRect(
            hoverX * cellWidth - 1,
            hoverY * cellHeight - 1,
            cellWidth + 2,
            cellHeight + 2
        );
    };
});


// Magnifying glass
function getAdaptiveZoomFactor() {
    if (!gridInfo) {
        console.log(`Didn't get grid info.`);
        return 1;
    }

    const scale = Math.log2(gridInfo.w / 10 + 1);
    return Math.min(6, 2 + scale * 1.5);
}

const lensCanvas = document.getElementById('lensCanvas');
const lensCtx = lensCanvas.getContext('2d');
const mainCanvas = document.getElementById('canvasAltered');
const zoomFactor = getAdaptiveZoomFactor();
let lensActive = false;

mainCanvas.addEventListener('contextmenu', e => e.preventDefault());
mainCanvas.addEventListener('mousedown', e => {
    if (e.button === 2) lensActive = true;
});
mainCanvas.addEventListener('mouseup', e => {
    if (e.button === 2) {
        lensActive = false;
        lensCanvas.style.display = 'none';
    }
});

mainCanvas.addEventListener('mousemove', e => {
    if (!lensActive || !gridInfo) {
        lensCanvas.style.display = 'none';
        return;
    }

    const rect = mainCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensSize = lensCanvas.width;

    const visibleCells = 5; 

    const cellW = mainCanvas.width / gridInfo.w;
    const cellH = mainCanvas.height / gridInfo.h;

    const zoomWidth = visibleCells * cellW;
    const zoomHeight = visibleCells * cellH;

    const srcX = x - zoomWidth / 2;
    const srcY = y - zoomHeight / 2;

    const ctxMain = mainCanvas.getContext('2d');

    const offCanvas = document.createElement('canvas');
    offCanvas.width = zoomWidth;
    offCanvas.height = zoomHeight;
    const offCtx = offCanvas.getContext('2d');

    offCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color') || '#000';
    offCtx.fillRect(0, 0, zoomWidth, zoomHeight);

    const readX = Math.max(0, srcX);
    const readY = Math.max(0, srcY);
    const readW = Math.min(mainCanvas.width - readX, zoomWidth);
    const readH = Math.min(mainCanvas.height - readY, zoomHeight);

    if (readW > 0 && readH > 0) {
        const imgData = ctxMain.getImageData(readX, readY, readW, readH);
        offCtx.putImageData(imgData, readX - srcX, readY - srcY);
    }

    lensCtx.clearRect(0, 0, lensSize, lensSize);
    lensCtx.save();
    lensCtx.beginPath();
    lensCtx.arc(lensSize / 2, lensSize / 2, lensSize / 2, 0, Math.PI * 2);
    lensCtx.clip();

    lensCtx.imageSmoothingEnabled = false;
    lensCtx.drawImage(offCanvas, 0, 0, zoomWidth, zoomHeight, 0, 0, lensSize, lensSize);
    lensCtx.restore();

    lensCanvas.style.left = `${e.clientX - lensSize / 2}px`;
    lensCanvas.style.top = `${e.clientY - lensSize / 2}px`;
    lensCanvas.style.display = 'block';
});



// Show hint
function showHint() {
    if (!gridInfo || !gameActive) 
        return;

    hintCount++;
    updateStatsCard();

    const canvas = document.getElementById('canvasAltered');
    const ctx = canvas.getContext('2d');

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;

    const img = new Image();
    img.src = canvas.dataset.src;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const halfCols = Math.floor(gridInfo.w / 2);
        const halfRows = Math.floor(gridInfo.h / 2);

        let regionWidth = halfCols * cellWidth;
        let regionHeight = halfRows * cellHeight;

        if (gridInfo.w % 2 !== 0) 
            regionWidth += cellWidth;
        if (gridInfo.h % 2 !== 0) 
            regionHeight += cellHeight;

        const pixelX = gridInfo.x;
        const pixelY = gridInfo.y;

        let xStart = 0;
        let yStart = 0;

        if (pixelX >= halfCols) xStart = canvas.width - regionWidth;
        if (pixelY >= halfRows) yStart = canvas.height - regionHeight;

        ctx.strokeStyle = 'rgba(120, 228, 255, 0.9)';
        ctx.lineWidth = 4;
        ctx.strokeRect(xStart, yStart, regionWidth, regionHeight);

        ctx.fillStyle = 'rgba(0, 59, 62, 0.17)';
        ctx.fillRect(xStart, yStart, regionWidth, regionHeight);
    };
}


// Surrender game and highlight correct pixel
function surrenderGame() {
    if (!gridInfo || !gameActive) 
        return;

    gameActive = false;
    saveFinalScore();

    const canvas = document.getElementById('canvasAltered');
    const ctx = canvas.getContext('2d');

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;

    const restartBtn = document.getElementById('startBtn');
    const restartHint = document.getElementById('restartHint');

    restartBtn.classList.add('restart-highlight');
    restartHint.classList.add('show');

    const img = new Image();
    img.src = canvas.dataset.src;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            gridInfo.x * cellWidth - 1,
            gridInfo.y * cellHeight - 1,
            cellWidth + 2,
            cellHeight + 2
        );
    };

    restartBtn.classList.add('restart-highlight');
}


// Save game statistics (top 10)
function saveFinalScore() {
    if (currentLevel <= 1) 
        return;
    
    const newScore = calculateFinalScore();

    const saved = localStorage.getItem('pixPointSpyTopScores');
    let scores = saved ? JSON.parse(saved) : [];

    scores.push(newScore);

    // Sort descending by total score
    scores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    if (scores.length > 10) scores = scores.slice(0, 10);

    localStorage.setItem('pixPointSpyTopScores', JSON.stringify(scores));
}


// Load game statistics
function loadStats() {
    const saved = localStorage.getItem('pixPointSpyStats');
    if (saved) {
        const stats = JSON.parse(saved);
        correctCount = stats.correctCount || 0;
        wrongCount = stats.wrongCount || 0;
        currentLevel = stats.currentLevel || 1;
    }
}


// Play sounds when clicking on pixels
function playSound(type) {
    let soundFile = "";
    if (type === "correct") soundFile = "sounds/correct.mp3";
    else if (type === "wrong") soundFile = "sounds/wrong.mp3";

    if (!soundFile) return;

    const audio = new Audio(soundFile);
    audio.volume = 0.2;
    audio.play().catch(err => console.warn("Sound play blocked:", err));
}


// Calculate final score
function calculateFinalScore() {
    endTime = Date.now();
    const totalTimeSec = Math.round((endTime - startTime) / 1000);

    const score = (correctCount * 100)
                - (wrongCount * 30)
                - (hintCount * 10)
                - (totalTimeSec / 2);

    return {
        date: new Date().toLocaleString(),
        level: currentLevel,
        wrong: wrongCount,
        hints: hintCount,
        time: totalTimeSec,
        score: Math.max(0, Math.round(score))
    };
}


// Save if user leaves page
window.addEventListener('beforeunload', () => {
    if (gameActive) {
        saveFinalScore();
    }
});


// Buttons
document.getElementById('startBtn').addEventListener('click', () => {
    const restartBtn = document.getElementById('startBtn');
    const restartHint = document.getElementById('restartHint');

    restartBtn.classList.remove('restart-highlight');
    restartHint.classList.remove('show');

    if (gameActive) {
        gameActive = false;
        saveFinalScore();
    }

    startGame();
});

document.getElementById('hintBtn').addEventListener('click', showHint);
document.getElementById('surrenderBtn').addEventListener('click', surrenderGame);


// Auto-start on page load
window.addEventListener('DOMContentLoaded', () => {
    startGame();
})