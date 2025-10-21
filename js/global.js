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




// Easter egg music
let typedKeys = '';
const originalMusic = 'sounds/music.mp3';

// Define available easter eggs
const easterEggs = {
    sonic: {
        url: 'https://www.squidify.org/rest/stream?u=Guest&t=3a98bc55391946445f6f838063cae8c6&s=40n50kuPl4y3r&v=1.16.0&c=Aonsoku&f=json&id=xEzAh7CognJSXtJVl2SQIr&estimateContentLength=true',
        effect: activateSonicEffect
    },
    kirby: {
        url: 'https://www.squidify.org/rest/stream?u=Guest&t=3a98bc55391946445f6f838063cae8c6&s=40n50kuPl4y3r&v=1.16.0&c=Aonsoku&f=json&id=n3ovhcjGtYpWFtYAeqoHZQ&estimateContentLength=true',
        effect: activateKirbyEffect
    }
};

// Detect secret key sequences
document.addEventListener('keydown', (e) => {
    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > 6) typedKeys = typedKeys.slice(-6);

    for (const [key, egg] of Object.entries(easterEggs)) {
        if (typedKeys.endsWith(key)) {
            activateEasterEgg(egg);
            typedKeys = '';
            break;
        }
    }
});

// Generic activation logic
function activateEasterEgg(egg) {
    bgMusic.pause();
    bgMusic.src = egg.url;
    bgMusic.loop = false;
    bgMusic.currentTime = 0;

    // Apply the visual effect for that egg
    egg.effect?.();

    bgMusic.play().then(() => {
        console.log('Easter egg activated!');
    }).catch(err => {
        console.warn('Failed to play easter egg music, reverting.', err);
        restoreOriginalMusic();
    });

    bgMusic.onended = restoreOriginalMusic;
    bgMusic.onerror = restoreOriginalMusic;
}

// Sonic visual effect
function activateSonicEffect() {
    const dash = document.createElement('div');
    dash.id = 'sonicDash';
    document.body.appendChild(dash);
    setTimeout(() => dash.remove(), 2500);
}

// Kirby visual effect
function activateKirbyEffect() {
    const star = document.createElement('div');
    star.id = 'kirbyStar';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 2500);
}

// Restore normal background music
function restoreOriginalMusic() {
    bgMusic.pause();
    bgMusic.src = originalMusic;
    bgMusic.loop = true;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(err => console.warn('Autoplay blocked on restore:', err));
}
