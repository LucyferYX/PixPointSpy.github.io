# PixPointSpy

**PixPointSpy** is a web-based “spot the difference” game where players need to identify the altered pixel between two almost identical images. The challenge increases with each level as the pixel grids become smaller. The game is accompanied by visually stylistic UI, music, sound effects, transitions and other visual elements to make the game feel more interesting.

#### Live hosted: https://lucyferyx.github.io/PixPointSpy.github.io/
#### Video demo:

This project was done as part of Harvard's CS50x course as the final project.

---

## Inspiration

My main passions in computer science field have always been front-end designing and game development. I wanted to create something visually appealing and fun, but also technically challenging. I thought of making similar simple games to Minesweeper, Wordle or some labyrinth games, but I didn't really want to copy something that already existed.

The idea for a single-pixel spotting game came to me as I was looking through of previous CS50 projects, specifically Week 4's "Filter" problem set, where we learned about image representation as a grid of pixels and how to create image filters. I thought there could be a potential for a game, where I would purposefully create a single pixel wrongly. I ended up enjoying this idea so much that I decided to stick with it and adding a lot of additional features to make it more appealing to play.

---

## Features

- **Image generation**: Random images are fetched from Lorem Picsum service each round.  
- **Increasing difficulty**: The number of pixels to spot increases with each level.
- **Gameplay variety**: The randomized nature of altered pixel and fetched image avoids repetiteveness.
- **Magnifying glass**: The game has magnifying glass functionality which let's you zoom in on the image.
- **Hints**: Hints can be used to help find the altered pixel with minor penalties.
- **Surrendering**: Surrender button can be used to reveal the altered pixel.
- **Score tracking**: Records top 10 best scores including level reached, wrong guesses, hints used and completion time.   
- **Dark/light mode**: Toggle between dark and light themes.
- **Music and sound effects**: The gameplay is accompanied by a nice tune and sound effects.
- **ENG/LV support**: Project has both English and Latvian language support.

---

## Usage

- Click **Play** on the homepage to start the game. 
- Identify the pixel that differs between the two images.
- Click on the altered pixel on the image on the right. 
- The game continues until all 100 levels are completed or until you surrender.  
- Scores are saved locally and displayed on the **Statistics** page.  

---

## Game logic

1. Fetch a Lorem Picsum image with random ID (1-1085), if fail then try with a different ID.
2. Create an offscreen small canvas with the defined grid.
3. Average the colors of the image to the grid cells.
4. Choose 1 random pixel and modify a single RGB channel.
5. Upscale both of the canvases - original and altered - to be displayed on the page.

---

## File design

The program is divided into three main HTML pages:
- `index.html` – serves as the homepage, introducing the game concept and rules, contains a big “Play” button.
- `game.html` – contains the game itself like image display, pixelation, canvas interactions, music and score mechanics.
- `statistics.html` – displays the locally stored high scores in a structured table format and contains explanation on how scores are calculated.

The program's style comes from 2 sources:
- Boostrap 5 - does the basic style structure.
- `style.css` - does most of the program's visual style and animations.

The program's logic is done with Javascript:
- `game.js` - contains everything needed for the game to work like image fetching, grid creation, pixelation, altered pixel creation, canvas interactions and score mechanics.
- `language.js` - contains dictionary for English and Latvian language and the logic for displaying the translations on pages.
- `music.js` - contains logic for playing music and sound effects, adjusting sound volume and some musical easter eggs.
- `statistics.js` - contains logic for reading, sorting and writing top 10 user scores from localStorage.
- `theme.js` - contains logic for switching the pages between light and dark theme.

---

## File structure

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
│       language.js
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

## Future improvements

There were a lot of features and polish I did for my project, which I am proud of. However, if I wanted to improve my game even more, then these are the features I would add in the future:
- Difficulty levels (easy, medium, hard).
- More strict image selection.
- Better small screen and mobile support.