// Change dark and light theme
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});


const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);



// Music and volume
const musicButton = document.getElementById('musicButton');
const musicDropdown = musicButton.closest('.music-dropdown');

musicButton.addEventListener('click', (e) => {
    musicDropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!musicDropdown.contains(e.target)) {
        musicDropdown.classList.remove('active');
    }
});

const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');

const savedVolume = localStorage.getItem('bgMusicVolume');
if (savedVolume !== null) {
    bgMusic.volume = savedVolume;
    volumeSlider.value = savedVolume;
} else {
    bgMusic.volume = volumeSlider.value;
}

function initMusic() {
    bgMusic.play().catch(err => console.warn("Music play blocked until interaction", err));
    document.removeEventListener('click', initMusic);
    document.removeEventListener('keydown', initMusic);
    document.removeEventListener('touchstart', initMusic);
}

document.addEventListener('click', initMusic);
document.addEventListener('keydown', initMusic);
document.addEventListener('touchstart', initMusic);

// Volume slider control
volumeSlider.addEventListener('input', () => {
    bgMusic.volume = volumeSlider.value;
    localStorage.setItem('bgMusicVolume', volumeSlider.value);
});