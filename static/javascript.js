let currentImageUrl = '';
let currentImageId = null;

async function loadRandomImage() {
    const response = await fetch('/random-image');
    const data = await response.json();
    currentImageUrl = data.url;
    currentImageId = data.id;
    document.getElementById('mainImage').src = currentImageUrl;
    document.getElementById('pixelatedImage').src = '';
}

const pixelSlider = document.getElementById('pixelSlider');
const pixelValue = document.getElementById('pixelValue');

pixelSlider.addEventListener('input', () => {
    pixelValue.textContent = pixelSlider.value;
});

async function pixelateCurrentImage() {
    if (!currentImageUrl) 
        return alert('No image loaded yet!');
    const pixelCount = parseInt(pixelSlider.value);

    const response = await fetch(`/pixelate-image?url=${encodeURIComponent(currentImageUrl)}&pixels=${pixelCount}`);
    const data = await response.json();
    document.getElementById('pixelatedImage').src = data.pixelated;
}

document.getElementById('newImageBtn').addEventListener('click', loadRandomImage);
document.getElementById('pixelateBtn').addEventListener('click', pixelateCurrentImage);

window.onload = loadRandomImage;