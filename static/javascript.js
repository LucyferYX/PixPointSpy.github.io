let currentImageUrl = '';
let currentImageId = null;

async function loadRandomImage() {
    const res = await fetch('/random-image');
    const data = await res.json();
    currentImageUrl = data.url;
    document.getElementById('canvasOriginal').getContext('2d').clearRect(0, 0, 640, 480);
    document.getElementById('canvasAltered').getContext('2d').clearRect(0, 0, 640, 480);
}

const pixelSlider = document.getElementById('pixelSlider');
const pixelValue = document.getElementById('pixelValue');

pixelSlider.addEventListener('input', () => {
    pixelValue.textContent = pixelSlider.value;
});

async function pixelateCurrentImage() {
    if (!currentImageUrl) return alert('No image loaded yet!');
    const pixelCount = parseInt(document.getElementById('pixelSlider').value);

    const res = await fetch(`/pixelate-image?url=${encodeURIComponent(currentImageUrl)}&pixels=${pixelCount}`);
    const data = await res.json();
    gridInfo = data.changed_pixel;

    // Log
    console.log("Pixel changed:", data.debug);

    drawImageToCanvas('canvasOriginal', data.original);
    drawImageToCanvas('canvasAltered', data.altered);
}

document.getElementById('newImageBtn').addEventListener('click', loadRandomImage);
document.getElementById('pixelateBtn').addEventListener('click', pixelateCurrentImage);

document.getElementById('canvasAltered').addEventListener('mousemove', (e) => {
    if (!gridInfo) 
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

    // Redraw image
    const img = new Image();
    img.src = canvas.dataset.src;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);

        // Adds a "pop" effect
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

document.getElementById('canvasAltered').addEventListener('click', (e) => {
    if (!gridInfo) 
        return;

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;

    const cellWidth = canvas.width / gridInfo.w;
    const cellHeight = canvas.height / gridInfo.h;

    const clickedX = Math.floor(xClick / cellWidth);
    const clickedY = Math.floor(yClick / cellHeight);

    if (clickedX === gridInfo.x && clickedY === gridInfo.y) {
        alert("✅ Correct pixel!");
    } else {
        alert("❌ Wrong pixel!");
    }
});

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

window.onload = loadRandomImage;