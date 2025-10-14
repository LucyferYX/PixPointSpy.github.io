let currentImageUrl = '';
let gridInfo = null;
let currentLevel = 1;
let pixelCount = 3;
let fetchingTries = 5;
let gameActive = false;

// Retry wrapper (because images sometimes don't get fetched correctly)
// 🔁 Unified image loading + pixelation with smarter fallback
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
                continue; // try a new image
            }

            const data = await pixRes.json();
            if (!data.original || !data.altered) 
                throw new Error("Incomplete data from server");

            return data;

        } catch (err) {
            console.warn(`⚠️ Attempt ${attempts} failed: ${err.message}`);
            await new Promise(r => setTimeout(r, 300)); // small delay
        }
    }

    throw new Error(`❌ Could not load valid image after ${maxRetries} attempts`);
}


// Draw base64 image to canvas
function drawImageToCanvas(canvasId, dataUrl) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.dataset.src = dataUrl;
    };
    img.src = dataUrl;
}

// Start or restart game
async function startGame() {
    gameActive = true;
    currentLevel = 1;
    pixelCount = 3;
    document.getElementById('levelCounter').textContent = currentLevel;
    await nextLevel();
}

// Move to the next level
async function nextLevel() {
    if (!gameActive) 
        return;

    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active'); // Cover canvases

    try {
        const data = await loadAndPixelateImage(pixelCount);
        gridInfo = data.changed_pixel;

        drawImageToCanvas('canvasOriginal', data.original);
        drawImageToCanvas('canvasAltered', data.altered);

        console.log(`🧩 Level ${currentLevel} | Pixels: ${pixelCount}`);
        console.log("Pixel changed:", data.debug);
    } catch (err) {
        console.error(err.message);
        alert("An image failed to load — please try restarting the game.");
        gameActive = false;
    } finally {
        setTimeout(() => overlay.classList.remove('active'), 300);
    }
}


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

        if (currentLevel > 100) {
            alert("🎉 Congratulations! You’ve completed all 100 levels!");
            gameActive = false;
            return;
        }

        nextLevel();
    } else {
        alert("❌ Wrong pixel! Try again.");
    }
});

// Hover highlight
document.getElementById('canvasAltered').addEventListener('mousemove', (e) => {
    if (!gridInfo || !gameActive) return;
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
        ctx.drawImage(img, 0, 0);
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

// 🟢 Start button
document.getElementById('startBtn').addEventListener('click', startGame);
