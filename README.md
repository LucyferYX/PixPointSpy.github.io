# PixPointSpy

**PixPointSpy** is a web-based “spot the difference” game where users need to identify the altered pixel between two images. The game progressively increases in difficulty and tracks your top 10 scores.

Live hosted: https://lucyferyx.github.io/PixPointSpy.github.io/

This project was done as part of Harvard's CS50x course as the final project.

---

## Features

- **Image loading**: Random images are fetched from Lorem Picsum service each round.  
- **Increasing difficulty**: The number of pixels to spot increases with each level.
- **Gameplay variety**: The randomized nature of altered pixel and fetched image avoids repetiteveness.
- **Hints**: Hints can be used to help find the altered pixel with minor penalties.
- **Surrendering**: Surrender button can be used to reveal the altered pixel.
- **Score tracking**: Records top 10 best scores including level reached, wrong guesses, hints used and completion time.   
- **Dark/light mode**: Toggle between dark and light themes.
- **Music**: The gameplay is accompanied by a nice tune and sound effects.

---

## Usage

- Click **Play** on the main page to start the game. 
- Identify the pixel that differs between the two images.
- Click on the altered pixel on the image on the right.
- Hints outline altered pixel's area but slightly reduce your final score.  
- The game continues until all levels are completed or until you surrender.  
- Scores are saved locally and displayed on the **Statistics** page.  

---

## File Structure

```
PixPointSpy.github.io/
│   game.html
│   index.html
│   README.md
│   statistics.html
│
├───css
│       styles.css
│
├───images
│       bg-dark.png
│       bg-light.png
│       icon.png
│       pixels.png
│
├───js
│       game.js
│       music.js
│       statistics.js
│       theme.js
│
└───sounds
        correct.mp3
        music.mp3
        wrong.mp3
```

---

## Tools used

- HTML5 & CSS3  
- JavaScript (ES6+)  
- Bootstrap 5
- LocalStorage API for saving statistics 
- Coded in Visual Studio Code IDE
