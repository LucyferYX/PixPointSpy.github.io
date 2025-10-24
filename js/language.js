// Dictionary - ENG and LV
const translations = {
    en: {
        title_game: "PixPointSpy Game",
        game: "Game",
        title_statistics: "PixPointSpy Statistics",
        statistics: "Statistics",

        // Index.html
        heading_main: "Pixel Spotting Game",
        description_main: 'A "spot the difference" game about finding a single pixel that differs between two images.',
        heading_how_to_play: "How to play:",
        rule_1: "Left-click the <b>altered pixel</b> on the right image to advance to the next level.",
        rule_2: "Right-click the image to <b>zoom in</b> the image.",
        rule_3: "Use <b>hints</b> to reveal section the pixel is located at.",
        rule_4: "Each level increases <b>difficulty</b> as the pixel grid becomes smaller.",
        rule_5: "Level, time, mistakes and hints used determine your final <b>score</b>.",

        challenge_heading: "Challenge Yourself!",
        challenge_description: "The game fetches from over <b>1000 random images</b> and selects a <b>different pixel</b> every time you play.",
        challenge_question: "Can you beat 100 levels?",
        play_button: "Play",

        footer_copyright: "Copyright © 2025 Liene Krista Neimane",
        footer_photos: "Photos:",
        footer_sounds: "Sound effects:",
        footer_music: "Background music:",
        source_correct: "Zapsplat - Correct",
        source_wrong: "Zapsplat - Wrong",

        // Game.html
        title_spot_diff: "Spot the Difference",
        loading_next_level: "Loading next level...",
        restart_hint: "Please restart the game!",
        game_info: "Game Info",
        restart_game: "Restart Game",
        level_label: "Level",
        pixel_grid_label: "Pixel Grid",
        time_label: "Time",
        hints_label: "Hints",
        correct_label: "Correct",
        mistakes_label: "Mistakes",
        hint_button: "Hint",
        surrender_button: "Surrender",

        // Statistics.html
        title_card_statistics: "Your game statistics",
        stats_loading: "Loading...",
        reset_stats: "Reset statistics",
        title_score_calc: "How your score is calculated",
        correct_guess: "<strong>Correct guess:</strong> +100 points each",
        mistakes_penalty: "<strong>Mistakes:</strong> -30 points each",
        hint_penalty: "<strong>Hint used:</strong> -10 points each",
        time_penalty: "<strong>Time taken:</strong> -0.5 points per second",

        // Statistics.js
        stats_empty: "No completed games yet. Play a few rounds to start your leaderboard!",
        table_rank: "#",
        table_date: "Date",
        table_level: "Level",
        table_mistakes: "Mistakes",
        table_hints: "Hints",
        table_time: "Time",
        table_score: "Score",
    },

    lv: {
        title_game: "PixPointSpy spēle",
        game: "Spēle",
        statistics: "Statistika",
        title_statistics: "PixPointSpy statistika",

        // Index.html
        heading_main: "Pikseļu meklēšanas spēle",
        description_main: "Atšķirību noteikšanas spēle, kurā jāatrod viens izmainītais pikselis starp diviem attēliem.",
        heading_how_to_play: "Kā spēlēt:",
        rule_1: "Ar kreiso klikšķi spied uz <b>izmainītā pikseļa</b> labajā attēlā, lai nokļūtu nākamajā spēles līmenī.",
        rule_2: "Ar labo klikšķi <b>pietuvini</b> labo attēlu.",
        rule_3: "Izmanto <b>norādes</b>, lai atklātu pikseļa atrašanās sadaļu.",
        rule_4: "Katrs līmenis palielina spēles <b>grūtības pakāpi</b>, samazinot pikseļu režģi.",
        rule_5: "Līmenis, laiks, kļūdas un izmantotās norādes nosaka tavu gala spēles <b>rezultātu</b>.",

        challenge_heading: "Izaicini sevi!",
        challenge_description: "Spēle izmanto vairāk nekā <b>1000 dažādu attēlu</b> un katru reizi izvēlas <b>izmainīt citu pikseli</b>.",
        challenge_question: "Vai vari pieveikt 100 līmeņus?",
        play_button: "Spēlēt",

        footer_copyright: "Autortiesības © 2025 Liene Krista Neimane",
        footer_photos: "Attēli:",
        footer_sounds: "Skaņas efekti:",
        footer_music: "Fona mūzika:",
        source_correct: "Zapsplat - Pareizi",
        source_wrong: "Zapsplat - Nepareizi",

        // Game.html
        title_spot_diff: "Atrodi atšķirību",
        loading_next_level: "Ielādē nākamo līmeni...",
        restart_hint: "Lūdzu, sāc spēli no jauna!",
        game_info: "Spēles informācija",
        restart_game: "Restartēt spēli",
        level_label: "Līmenis",
        pixel_grid_label: "Pikseļu režģis",
        time_label: "Laiks",
        hints_label: "Norādes",
        correct_label: "Pareizi",
        mistakes_label: "Kļūdas",
        hint_button: "Norāde",
        surrender_button: "Padoties",

        // Statistics.html
        title_card_statistics: "Tava spēles statistika",
        stats_loading: "Ielādējas...",
        reset_stats: "Izdzēst esošos rezultātus",
        title_score_calc: "Kā rezultāts tiek aprēķināts",
        correct_guess: "<strong>Pareiza atbilde:</strong> +100 punkti par katru",
        mistakes_penalty: "<strong>Kļūdas:</strong> -30 punkti par katru",
        hint_penalty: "<strong>Izmantots padoms:</strong> -10 punkti par katru",
        time_penalty: "<strong>Spēles laiks:</strong> -0.5 punkti par katru sekundi",
        
        // Statistics.js
        stats_empty: "Jūs neesat izspēlējis nevienu spēli. Izspēlējiet dažus līmeņus, lai redzētu savu rezultātu tabulu!",
        table_rank: "#",
        table_date: "Datums",
        table_level: "Līmenis",
        table_mistakes: "Kļūdas",
        table_hints: "Norādes",
        table_time: "Laiks",
        table_score: "Rezultāts",
    }
};



// Manages language translations
let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const translation = translations[lang][key];
        if (translation) {
            el.innerHTML = translation;
        }
    });

    if (translations[lang]['title']) {
        document.title = translations[lang]['title'];
    }
}

function updateLangButtonText() {
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.textContent = currentLang === 'en' ? 'LV' : 'EN';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        updateLangButtonText();

        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'lv' : 'en';
            setLanguage(newLang);
            updateLangButtonText();
            renderStats();
        });
    }
});