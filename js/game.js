let currentImageUrl = '';
let gridInfo = null;
let gameActive = false;
let lastClickTime = 0;

const MAX_CANVAS_WIDTH = 420;
const MAX_CANVAS_HEIGHT = 420;

// Game statistics
let currentLevel = 1;
let pixelCount = 3;
let correctCount = 0;
let wrongCount = 0;


// Return a random Lorem Picsum image
function getRandomImageUrl() {
  const width = 640;
  const height = 480;
  const imgId = Math.floor(Math.random() * 1085);
  return `https://picsum.photos/id/${imgId}/${width}/${height}`;
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

    return { original: originalB64, altered: alteredB64, changed_pixel, debug };
}



function drawImageToCanvas(canvasId, dataUrl) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const scale = Math.min(1, MAX_CANVAS_WIDTH / img.width, MAX_CANVAS_HEIGHT / img.height);

        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

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

    updateStatsCard();
    await nextLevel();
}


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


function updateStatsCard() {
    const gridHeight = pixelCount;
    const gridWidth  = Math.floor((3 * gridHeight - 1) / 4);

    document.getElementById('levelCounter').textContent = currentLevel;
    document.getElementById('pixelCount').textContent = `${gridHeight} × ${gridWidth}`;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;

    saveStats();
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

        if (currentLevel > 100) {
            alert("🎉 Congratulations! You’ve completed all 100 levels!");
            gameActive = false;
            return;
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

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeRect(
            hoverX * cellWidth - 1,
            hoverY * cellHeight - 1,
            cellWidth + 2,
            cellHeight + 2
        );
    };
});


// Show hint
function showHint() {
    if (!gridInfo || !gameActive) return;

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

        if (gridInfo.w % 2 !== 0) regionWidth += cellWidth;
        if (gridInfo.h % 2 !== 0) regionHeight += cellHeight;

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

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            gridInfo.x * cellWidth - 1,
            gridInfo.y * cellHeight - 1,
            cellWidth + 2,
            cellHeight + 2
        );
    };
}


// Save game statistics
function saveStats() {
    const stats = { correctCount, wrongCount, currentLevel };
    localStorage.setItem('pixPointSpyStats', JSON.stringify(stats));
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
    audio.volume = 0.3; // adjust as needed (0.0 - 1.0)
    audio.play().catch(err => console.warn("Sound play blocked:", err));
}


// Buttons
document.getElementById('surrenderBtn').addEventListener('click', surrenderGame);
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('hintBtn').addEventListener('click', showHint);

// Auto-start on page load
window.addEventListener('DOMContentLoaded', () => {
    startGame();
})
