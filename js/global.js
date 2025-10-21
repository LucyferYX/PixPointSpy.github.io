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





// Sonic easter egg
let typedKeys = '';  
const originalMusic = 'sounds/music.mp3'

document.addEventListener('keydown', (e) => {
    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > 5) typedKeys = typedKeys.slice(-5);

    if (typedKeys === 'sonic') {
        activateSonicMode();
        typedKeys = '';
    }
});

function activateSonicMode() {
    console.log('Sonic mode activated!');

    bgMusic.pause();

    const sonicTrack = 'https://www.squidify.org/rest/stream?u=Guest&t=3a98bc55391946445f6f838063cae8c6&s=40n50kuPl4y3r&v=1.16.0&c=Aonsoku&f=json&id=xEzAh7CognJSXtJVl2SQIr&estimateContentLength=true';

    bgMusic.src = sonicTrack;
    bgMusic.loop = false;
    bgMusic.currentTime = 0;

    document.body.classList.add('sonic-mode');
    setTimeout(() => document.body.classList.remove('sonic-mode'), 3000);

    bgMusic.play().then(() => {
        console.log('Sonic easter egg found! Playing Undefeatable...');
    }).catch(err => {
        console.warn('Failed to load music. Reverting to normal.', err);
        restoreOriginalMusic();
    });

    bgMusic.onended = restoreOriginalMusic;
    bgMusic.onerror = restoreOriginalMusic;
}

function restoreOriginalMusic() {
    bgMusic.pause();
    bgMusic.src = originalMusic;
    bgMusic.loop = true;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(err => console.warn('Autoplay blocked on restore:', err));
}