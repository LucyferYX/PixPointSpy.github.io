let currentImageUrl = '';
let gridInfo = null;
let fetchingTries = 5;
let gameActive = false;
let cachedAlteredImg = null;

const MAX_CANVAS_WIDTH = 420;
const MAX_CANVAS_HEIGHT = 420;

// Game statistics
let currentLevel = 1;
let pixelCount = 3;
let correctCount = 0;
let wrongCount = 0;


// Image loading, pixelation, fallback
async function loadAndPixelateImage(pixelCount, maxRetries = 5) {
    let attempts = 0;

    while (attempts < maxRetries) {
        attempts++;

        try {
            // Get a new random image each retry
            const imgRes = await fetch('/random-image');
            if (!imgRes.ok) 
                throw new Error('Failed to fetch random image');
            const imgData = await imgRes.json();

            const imageUrl = imgData.url;
            console.log(`🎲 Attempt ${attempts}: Trying image ${imageUrl}`);

            // Try to pixelate it
            const pixRes = await fetch(
                `/pixelate-image?url=${encodeURIComponent(imageUrl)}&pixels=${pixelCount}`
            );

            if (!pixRes.ok) {
                console.warn(`⚠️ Invalid image response from ${imageUrl} (${pixRes.status})`);
                continue;
            }

            const data = await pixRes.json();
            if (!data.original || !data.altered) 
                throw new Error("Incomplete data from server");

            return data;

        } catch (err) {
            console.warn(`⚠️ Attempt ${attempts} failed: ${err.message}`);
            await new Promise(r => setTimeout(r, 300));
        }
    }

    throw new Error(`❌ Could not load valid image after ${maxRetries} attempts`);
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

        if (canvasId === 'canvasAltered') {
            cachedAlteredImg = new Image();
            cachedAlteredImg.src = dataUrl;
        }
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
        const data = await loadAndPixelateImage(pixelCount);
        gridInfo = data.changed_pixel;

        drawImageToCanvas('canvasOriginal', data.original);
        drawImageToCanvas('canvasAltered', data.altered);

        console.log(`🧩 Level ${currentLevel} | Pixels: ${pixelCount}`);
        console.log("Pixel changed:", data.debug);
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
}


// Manages canvas coordinate system
canvasAltered.addEventListener("click", function(event) {
    const rect = canvasAltered.getBoundingClientRect();

    const scaleX = canvasAltered.width / rect.width;
    const scaleY = canvasAltered.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    handleClickOnCanvas(x, y);
});


// Handle user click on altered image
document.getElementById('canvasAltered').addEventListener('click', (e) => {
    if (!gridInfo || !gameActive) return;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;

    const clickedX = Math.floor(xClick / cellWidth);
    const clickedY = Math.floor(yClick / cellHeight);

    if (clickedX === gridInfo.x && clickedY === gridInfo.y) {
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
        wrongCount++;
        updateStatsCard();
        alert("❌ Wrong pixel! Try again.");
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


// Buttons
document.getElementById('surrenderBtn').addEventListener('click', surrenderGame);
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('hintBtn').addEventListener('click', showHint);

// Auto-start on page load
window.addEventListener('DOMContentLoaded', () => {
    startGame();
})
