"use strict";
/* 
    TO DO LIST
*/
var vars = {
    version: '1.9.4',
    DEBUG: false,
    currentGameDifficulty: '',
    gameWon: false,
    textColour: '#06d474',

    localStorage: {
        key: 'sudoku_',
        
        init: ()=> {
            const ls = vars.localStorage;
            let bonusDetailsDefaults = vars.bonusDetailsDefaults = JSON.stringify({bronze: {gamesUntilUnlock: 3, bonus: 100}, silver: {gamesUntilUnlock: 3, bonus: 150}, gold: {gamesUntilUnlock: 3, bonus: 200}});
            if (!localStorage.getItem(ls.key+'bonus')) localStorage.setItem(ls.key+'bonus', bonusDetailsDefaults);
            
            /* BONUS AND POINTS DETAILS */
            let bG = JSON.parse(localStorage.getItem(ls.key+'bonus'));
            vars.bonusGames.bronze = bG.bronze;
            vars.bonusGames.silver = bG.silver;
            vars.bonusGames.gold = bG.gold;

            if (!localStorage.getItem(ls.key+'bonusPointsEnabledUntil')) localStorage.setItem(ls.key+'bonusPointsEnabledUntil', '20241225');
            if (!localStorage.getItem(ls.key+'bonusPointsEnabled')) localStorage.setItem(ls.key+'bonusPointsEnabled', 'false');
            if (!localStorage.getItem(ls.key+'pointsUntilNextLevel')) localStorage.setItem(ls.key+'pointsUntilNextLevel', vars.getPointsUntilNextLevel());
            if (!localStorage.getItem(ls.key+'pointsUntilNextLevelMax')) localStorage.setItem(ls.key+'pointsUntilNextLevelMax', vars.pointsUntilNextLevel);
            vars.bonusPointsEnabled = localStorage.getItem(ls.key+'bonusPointsEnabled')==='true';
            vars.bonusPointsEnabledUntil = localStorage.getItem(ls.key+'bonusPointsEnabledUntil');
            vars.pointsUntilNextLevel = localStorage.getItem(ls.key+'pointsUntilNextLevel')*1;
            vars.pointsUntilNextLevelMax = localStorage.getItem(ls.key+'pointsUntilNextLevelMax')*1;
            
            document.getElementById('pointsUntilNextLevelNum').textContent = vars.pointsUntilNextLevel;
            /* END OF BONUS AND POINTS DETAILS */
            


            /* PLAYER DATA, LEVEL and POINTS */
            if (!localStorage.getItem(ls.key+'playerData')) localStorage.setItem(ls.key+'playerData', JSON.stringify(vars.playerData));
            if (!localStorage.getItem(ls.key+'level')) localStorage.setItem(ls.key+'level', '0');
            if (!localStorage.getItem(ls.key+'points')) localStorage.setItem(ls.key+'points', '0');
            vars.playerData = JSON.parse(localStorage.getItem(ls.key+'playerData'));
            vars.playerLevel = localStorage.getItem(ls.key+'level')*1;
            vars.playerPoints = localStorage.getItem(ls.key+'points')*1;
            /* END OF PLAYER DATA */



            /* COLOUR SCHEME AND BACKGROUND */
            if (!localStorage.getItem(ls.key+'colourScheme')) localStorage.setItem(ls.key+'colourScheme', 'default');

            if (!localStorage.getItem(ls.key+'backgroundType')) localStorage.setItem(ls.key+'backgroundType', 'texture');
            if (!localStorage.getItem(ls.key+'animatedBackgroundIndex')) localStorage.setItem(ls.key+'animatedBackgroundIndex', '0');
            if (!localStorage.getItem(ls.key+'backgroundImage')) localStorage.setItem(ls.key+'backgroundImage', 'bgTexture1');
            if (!localStorage.getItem(ls.key+'positionedImage')) localStorage.setItem(ls.key+'positionedImage', 'none');

            
            let cs = localStorage.getItem(ls.key+'colourScheme');
            backgroundColourChange(cs);
            
            vars.backgroundType = localStorage.getItem(ls.key+'backgroundType');
            
            vars.animatedBackgroundSelectedIndex = localStorage.getItem(ls.key+'animatedBackgroundIndex')*1;
            vars.backgroundImage = localStorage.getItem(ls.key+'backgroundImage');
            vars.positionedImage = localStorage.getItem(ls.key+'positionedImage');
            /* END OF COLOUR SCHEME AND BACKGROUND */



            // check to see if the bonus points date has passed
            let nowDate = new Date();
            let untilDate = new Date(vars.bonusPointsEnabledUntil.slice(0,4)*1, (vars.bonusPointsEnabledUntil.slice(4,6)*1)-1, vars.bonusPointsEnabledUntil.slice(6,8)*1);
            if (vars.bonusPointsEnabled && nowDate >= untilDate) {
                vars.bonusPointsEnabled = false;
                vars.bonusGames.reset(); // reset bG.bronze, silver and gold and save them
            };
        },

        reset: ()=> {
            for (let l in localStorage) {
                if (l.startsWith(vars.localStorage.key)) { delete localStorage[l]; console.log(`Deleted ${l}`); };
            };
        },

        saveAnimatedBackgroundIndex: ()=> {
            let index = vars.animatedBackgroundSelectedIndex;
            const ls = vars.localStorage;
            localStorage.setItem(ls.key+'animatedBackgroundIndex', index);
        },

        saveBGImage: ()=> {
            const ls = vars.localStorage;
            localStorage.setItem(ls.key+'backgroundImage', vars.backgroundImage);
        },
        
        saveBonusDetails: ()=> {
            const ls = vars.localStorage;
            let bG = vars.bonusGames;
            localStorage.setItem(ls.key+'bonus', JSON.stringify({ bronze: bG.bronze, silver: bG.silver, gold: bG.gold }));
            localStorage.setItem(ls.key+'bonusPointsEnabled', vars.bonusPointsEnabled ? 'true' : 'false');
            localStorage.setItem(ls.key+'bonusPointsEnabledUntil', vars.bonusPointsEnabledUntil);
        },

        saveColourScheme: (colour)=> {
            const ls = vars.localStorage;
            localStorage.setItem(ls.key+'colourScheme', colour);
        },

        saveUpdatedPlayerData: ()=> {
            const ls = vars.localStorage;
            localStorage.setItem(ls.key+'playerData', JSON.stringify(vars.playerData));
        },

        showAllVars: ()=> {
            for (let l in localStorage) {
                if (l.startsWith(vars.localStorage.key)) { console.log(`${l} ${localStorage[l]}`); };
            };
        },

        updateBonusGamePointsForWin: ()=> {
            let key = vars.localStorage.key;
            let bonusGameDetails = JSON.parse(localStorage.getItem(`${key}bonusPuzzle`));
            if (!bonusGameDetails) return; // no bonus game in progress

            bonusGameDetails[vars.currentGameDifficulty].playerPointsOnWin = playerPointsOnWinNum.textContent*1;
            bonusGameDetails[vars.currentGameDifficulty].hintsUsed = bonusGameDetails[vars.currentGameDifficulty].hintsUsed*1 + 1;

            localStorage.setItem(`${key}bonusPuzzle`, JSON.stringify(bonusGameDetails));
        },

        updateBonusGamePositions: (r,c)=> {
            let key = vars.localStorage.key;
            let bonusGameDetails = JSON.parse(localStorage.getItem(`${key}bonusPuzzle`));
            if (!bonusGameDetails) return; // no bonus game in progress

            bonusGameDetails[vars.currentGameDifficulty].positions.push({r,c});
            localStorage.setItem(`${key}bonusPuzzle`, JSON.stringify(bonusGameDetails));
        }
    },

    animate: {
        showNewLevel: false,

        colourAndLevelUp: ()=> {
            vars.animate.showNewLevel = false; // reset the var

            !document.querySelector('#playerStatsContainer.active') && document.querySelector('#playerStatsContainer').classList.add('active'); // show the player data if it isnt visible

            let div = document.getElementById('playerColourAndLevel');
            div.classList.add('scale-animation');
            setTimeout(()=> {
                div.classList.remove('scale-animation');
                div = document.getElementById('playerStatsInnerContainer');
                div.classList.add('shake-animation');
                setTimeout(()=> {
                    div.classList.remove('shake-animation');
                }, 510);
            }, 510);
        }
    },

    animatedBackgroundOptions: ['animals','food','fruits','leaves_n_flowers','sweets'],
    animatedBackgroundSelectedIndex: 0,

    animationEntries: [], // array of {r,c,number,value,min,max,inc,complete,delayInFrames}

    audio: {
        loadedFiles: {},
        init: ()=> {
            ['cheatsEnabled','gainLevel','pointsIncrease','fireworkExplode'].forEach((f)=> {
                let a = new Audio(`./audio/${f}.ogg`);
                f==='pointsIncrease' && (a.loop = true);
                a.load();
                vars.audio.loadedFiles[f] = a;
            });
        },

        play: (file)=> {
            if (!vars.audio.loadedFiles[file]) return;

            let a = vars.audio.loadedFiles[file];
            if (file==='pointsIncrease' && !a.paused) return;

            a.currentTime = 0;
            a.play();
        },

        stop: (file)=> {
            if (!vars.audio.loadedFiles[file]) return;

            let a = vars.audio.loadedFiles[file];
            a.pause();
            a.currentTime = 0;
        }
    },

    backgroundImage: 'bgTexture1', // default background image
    backgroundType: 'animated',
    bad: [], // array of {r,c} objects for cells that are in conflict

    isBonusGame: false,
    bonusPointsEnabled: false, // if the player has completed all bronze, silver and gold bonus games, they get double score for 1 week
    bonusPointsEnabledUntil: '20241225',
    bonusGames: {
        bronze: {
            gamesUntilUnlock: 3, bonus: 100, complete: false
        },
        silver: {
            gamesUntilUnlock: 3, bonus: 150, complete: false
        },
        gold: {
            gamesUntilUnlock: 3, bonus: 200, complete: false
        },

        // runs after the player wins a game
        checkForBonusGame: ()=> {
            if (vars.bonusPointsEnabled) return; // already got double points

            let bG = vars.bonusGames;
            if (bG.bronze.gamesUntilUnlock === 0 && !bG.bronze.complete) {
                vars.DEBUG && console.log(`Player is still to complete their bronze bonus game`);
                return; // already unlocked
            };
            if (bG.silver.gamesUntilUnlock === 0 && !bG.silver.complete) {
                vars.DEBUG && console.log(`Player is still to complete their silver bonus game`);
                return; // already unlocked
            };
            if (bG.gold.gamesUntilUnlock === 0 && !bG.gold.complete) {
                vars.DEBUG && console.log(`Player is still to complete their gold bonus game`);
                return; // already unlocked
            };

            // has bronze got any games left?
            let highlightBonusGameButton = false;
            if (bG.bronze.gamesUntilUnlock > 0) {
                bG.bronze.gamesUntilUnlock--;
                if (bG.bronze.gamesUntilUnlock === 0) {
                    highlightBonusGameButton = true;
                };
            } else if (bG.silver.gamesUntilUnlock > 0) {
                bG.silver.gamesUntilUnlock--;
                if (bG.silver.gamesUntilUnlock === 0) {
                    highlightBonusGameButton = true;
                };
            } else if (bG.gold.gamesUntilUnlock > 0) {
                bG.gold.gamesUntilUnlock--;
                if (bG.gold.gamesUntilUnlock === 0) {
                    highlightBonusGameButton = true;
                };
            } else {
                vars.bonusPointsEnabled = true;
                vars.setBonusEndDate();
            };

            if (highlightBonusGameButton) {
                bonusGameButton.classList.add('active');
            };

            vars.localStorage.saveBonusDetails();
        },

        drawBonusPips: ()=> {
            bonusGameButton.innerHTML = '';
            
            let currentBonusLevel = vars.getCurrentBonusLevel();
            
            let html = `BONUS GAME: ${currentBonusLevel ? currentBonusLevel.toUpperCase() : 'ALL COMPLETE'} <div id="bonusPips">`;
            if (!currentBonusLevel) {
                bonusGameButton.classList.remove('active');
                bonusGameButton.classList.add('twoTimesBonus');
                bonusGameButton.innerHTML = '2x POINTS!';
                return; // all bonus games complete
            };

            let currentBonusGame = vars.bonusGames[currentBonusLevel];
            let gTU = currentBonusGame.gamesUntilUnlock;
            let complete = 0;
            for (let i=3; i>0; i--) {
                if (i>gTU) {
                    complete++;
                    html += `<div class="pipGreen"><i class="fa-solid fa-circle-check"></i></div>\n`;
                } else {
                    html +=`<div class="pipRed"><i class="fa-solid fa-circle-xmark"></i></div>\n`;
                };
            };
            html +=`</div>`; // close bonusPips div
            
            if (complete===3) {
                let bGImage = currentBonusLevel==='bronze' ? "url('./images/bronzeBG.png')" : currentBonusLevel==='silver' ? "url('./images/silverBG.png')" : "url('./images/goldBG.png')";
                let bonusPoints = currentBonusGame.bonus;
                let difficultyMultiplier = vars.currentGameDifficulty === 'hard' ? 3 : vars.currentGameDifficulty === 'medium' ? 2 : 1;
                html += `<div id="bonusPointsCount">BONUS: ${bonusPoints*difficultyMultiplier} points</div>`;
                bonusGameButton.classList.add('active');
                bonusGameButton.style.backgroundImage = bGImage;
            };

            if (!gTU) {
                // console.log(`User can now click on the bonus game button!`);
            };

            bonusGameButton.innerHTML = html;
        },

        reset: ()=> {
            vars.DEBUG && console.log(`Resetting bonus game details`);
            let bG = vars.bonusGames;
            bG.bronze.gamesUntilUnlock = 3; bG.bronze.complete = false;
            bG.silver.gamesUntilUnlock = 3; bG.silver.complete = false;
            bG.gold.gamesUntilUnlock = 3; bG.gold.complete = false;
            vars.localStorage.saveBonusDetails();
        }
    },

    cellWidth: 9,

    cheats: {
        SolveBarOne: ()=> {
            vars.updatePlayerData('played'); // add one to the played counter

            let fillCount = puzzle.flat(1).filter(i=>!i).length-1;

            puzzle.forEach((r,rI)=> {
                r.forEach((c,cI)=> {
                    if (!fillCount) return;
                    if (!c) {
                        fillCount--;
                        let value = solution[rI][cI];
                        puzzle[rI][cI] = value;
                        vars.playerEntryList.push({ r: rI, c: cI, n: value });
                    };
                });
            });
            vars.draw();
        }
    },

    images: {
        bgFiles: [
            { name: '', file: './images/backgrounds/bgTexture1.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture2.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture3.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture4.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture5.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture6.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture7.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture8.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture9.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture10.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture11.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture12.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture13.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture14.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture15.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture16.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture17.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture18.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture19.jpg', loaded: false },
            { name: '', file: './images/backgrounds/bgTexture20.jpg', loaded: false }
        ],

        init: ()=> {
            let iV = vars.images;
            let bgFiles = iV.bgFiles;
            let bgImageOptions = document.getElementById('bgImageOptions');
            bgFiles.forEach((b,i)=> {
                let img = new Image();
                img.src = b.file;
                b.name = b.file.split('/').pop().split('.').shift();
                let div = document.createElement('div');
                div.classList.add('bgImageOption');
                div.style.backgroundImage = `url(${b.file})`;
                div.addEventListener('click', ()=> {
                    vars.DEBUG && console.log(`User selected background image: ${b.name}`);
                    vars.backgroundImage = b.name;
                    vars.switchToBackgroundType('texture', b.name);
                });
                bgImageOptions.appendChild(div);

                img.onload = ()=> {
                    b.loaded = true;
                };
            });

            // add the new animated wallpaper options
            vars.animatedBackgroundOptions.forEach((b,i)=> {
                let div = document.createElement('div');
                div.classList.add('bgImageOptionAnimated');
                div.style.backgroundImage = `url(./images/animatedBGicon.png)`;
                div.innerText = b.replaceAll('_',' ').toUpperCase();
                div.addEventListener('click', ()=> {
                    let selected = vars.animatedBackgroundOptions[i];
                    vars.DEBUG && console.log(`User selected animated background image: ${selected}`);
                    vars.setBackgroundImage(true); // clear the static background image
                    if (i === vars.animatedBackgroundSelectedIndex) { // we just need to show it
                        vars.switchToAnimatedWallpaper(true);
                        return; // already selected
                    };
                    
                    vars.animatedBackgroundSelectedIndex = i;
                    vars.switchToBackgroundType('animated', i);
                });
                bgImageOptions.appendChild(div);
            });

            let positionedImages = vars.positionedImageClass.getTypes();
            positionedImages.forEach((b,i)=> {
                let div = document.createElement('div');
                div.classList.add('bgImageOptionPositioned');
                div.style.backgroundImage = `url(./images/positionedBGicon.png)`;
                let text = b.length>14 ? b.slice(0,11)+'...' : b;
                div.innerText = text.replaceAll('_',' ').toUpperCase();
                div.addEventListener('click', ()=> {
                    vars.DEBUG && console.log(`User selected positioned background image: ${b}`);
                    vars.switchToBackgroundType('positioned', b);
                });
                bgImageOptions.appendChild(div);
            });
        },

        isValid: (which)=> {
            return vars.images.bgFiles.findIndex(b=>b.name===which) !==-1;
        }
    },

    playerData: {
        easy:   { played: 0, won: 0, hints: 0 },
        medium: { played: 0, won: 0, hints: 0 },
        hard:   { played: 0, won: 0, hints: 0 }
    },
    playerLevel: 0,
    playerPoints: 0,

    playerEntryList: [], // holds the placed positions for the current puzzle

    pointsToCount: 0,
    pointsUntilNextLevel: null,
    pointsUntilNextLevelMax: null,

    positionedImage: 'none',
    positionedImageClass: null,

    selected: { r: -1, c: -1 },

    winAnimationRunning: false,
    winAnimationType: 'ScaleDown', // 'ScaleUpScaleDown' or 'ScaleDown'

    init: ()=> {
        console.log(`%cSudoku version ${vars.version}`,`color: ${vars.textColour}; font-weight: bold; font-size: 15px;`);
        document.getElementById('versionText').textContent = `Version: ${vars.version}`;

        vars.audio.init();
        vars.localStorage.init();

        // needs to be initialised before images init() as I need the options from the class
        vars.positionedImageClass = new PositionedImage('mainContainer', vars.positionedImage);

        vars.images.init();
        vars.initButtonEventListeners();
        vars.initKeyboardEventListeners();
        vars.initMouseEventListeners();

        // initialise the fireworks class
        vars.classFireworks = new Fireworks('fwCanvas', {
            rocketMinSpeed: 7,
            rocketMaxSpeed: 10,
            gravity: 0.18,
            particleCount: 160,
            particleLife: 70,
            spawnInterval: 1000,
        });

        difficultySelect.addEventListener('change', (d) => {
            d = d.target;
            vars.updateDifficultyColour(d);
            vars.newPuzzle();
            vars.bonusGames.drawBonusPips();
        });
        vars.updateDifficultyColour(difficultySelect);

        if (!vars.pointsUntilNextLevel) {
            vars.getPointsUntilNextLevel();
        };

        // init display
        document.getElementById('playerLevelNum').textContent = vars.playerLevel;
        document.getElementById('playerPointsNum').textContent = vars.playerPoints;
        document.getElementById('pointsUntilNextLevelNum').textContent = vars.pointsUntilNextLevel;

        let lPC = vars.LevelAndPointsClass = new LevelAndPointsClass('levelCanvas');
        lPC.draw(vars.playerLevel, vars.getCurrentPointsAsPercentage());

        vars.newPuzzle(); // we need the difficulty before we can decide the multiplier for the bonus game

        vars.bonusGames.drawBonusPips();

        vars.getDiamondStartLevel();

        vars.updatePlayerDataUI();
        vars.updatePlayerAndColourUI();

        
        /* set up the image classes */
        vars.initAnimatedWallpaperClass();
        /* end of set up image classes */

        /* set the background according to the saved settings */
        let imageValue = null;
        switch (vars.backgroundType) {
            case 'animated':
                imageValue = vars.animatedBackgroundSelectedIndex;
            break;

            case 'positioned':
                imageValue = vars.positionedImage;
            break;

            case 'texture':
                imageValue = vars.backgroundImage;
            break;
        };
        vars.switchToBackgroundType(vars.backgroundType, imageValue);
        /* end of set background according to saved settings */
        
        // initialise the help page to page 0
        vars.help.showPage(0);

        setTimeout(()=> {
            vars.hideLoadingScreen();
        }, 1000);
    },

    initAnimatedWallpaperClass: ()=> {
        let selected = vars.animatedBackgroundOptions[vars.animatedBackgroundSelectedIndex];

        const canvas = document.getElementById("imageFieldCanvas");
        let tint = `${vars.bgTint}80` || '#ff800080';
        let spriteData = {
            imageSrc: `./images/backgroundPieces/${selected}_x84.png`,
            spriteSizeW: 84, // in px
            bgTint: tint
        };

        vars.ImageFieldClass = new ImageField(canvas, spriteData);
        if (vars.backgroundImage!=='none') {
            vars.ImageFieldClass.stop(); // stop the animation until the user enables it by selecting an animated wallpaper option
            return;
        };

        vars.switchToAnimatedWallpaper(true);
    },

    initButtonEventListeners: ()=> {
        backgroundImagesButton.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(backgroundImagesButton)) return;

            vars.hideAllOptionContainers();
            vars.switchBGOptionsVisibility();
        });

        bonusGameButton.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(bonusGameButton)) return;
            if (!document.querySelector('#bonusGameButton.active')) return;

            vars.disableButtonsAfterWin(false);

            bonusGameButton.classList.remove('active');
            bonusGameButton.style.backgroundImage = 'none';
            vars.isBonusGame = true;
            vars.disableSolutionButton(true); // user doesnt get to use the solution button in a bonus game
            vars.showBonusMessages(true);
            vars.newPuzzle();
        });

        checkBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(checkBtn)) return;
            if (vars.gameWon) return;

            vars.bad = vars.findConflicts(puzzle);

            !vars.bad.length && vars.updateCheckButtonText();

            vars.draw();
        });

        closeStatsBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(closeStatsBtn)) return;

            document.getElementById('playerStatsContainer').classList.remove('active');
        });

        colourSettingsButton.addEventListener('click', ()=> {
            if (!vars.buttonIsEnabled(colourSettingsButton)) return;

            vars.hideAllOptionContainers();
            vars.switchColourOptionsVisibility();
        });

        // always enabled
        exitCancelButton.addEventListener('click', () => {
            document.getElementById('exitBonusGameContainer').classList.remove('active');
        });

        // always enabled
        exitOKButton.addEventListener('click', () => {
            document.getElementById('exitBonusGameContainer').classList.remove('active');
            vars.isBonusGame = false;
            vars.localStorage.saveBonusDetails();
            bonusGameButton.classList.add('active');

            let currentBonusLevel = vars.getCurrentBonusLevel();
            let bGImage = currentBonusLevel==='bronze' ? "url('./images/bronzeBG.png')" : currentBonusLevel==='silver' ? "url('./images/silverBG.png')" : "url('./images/goldBG.png')";
            bonusGameButton.style.backgroundImage = bGImage;
            playerPointsOnWin.style.display='flex'

            vars.disableSolutionButton(false);
            vars.showBonusMessages(false);

            vars.playerEntryList.length && vars.updatePlayerData('played', true); // if the player has made any entries, reduce played count

            vars.newPuzzle();
        });

        // Always enabled
        helpButton.addEventListener('click', ()=> {
            vars.hideAllOptionContainers();
            vars.showHelpContainer(true);
        });

        // the hint button has an override for right click. that event listener is in initMouseEventListeners()
        hintBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(hintBtn)) return;
            if (vars.gameWon) return;

            vars.giveHint();
        });

        newBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(newBtn)) return;

            if (vars.isBonusGame && !vars.gameWon) {
                document.getElementById('exitBonusGameContainer').classList.add('active');
                return; // cannot start a new game while in a bonus game
            };

            vars.disableButtonsAfterWin(false);

            vars.newPuzzle();
        });

        // Always enabled
        playerDetailsButton.addEventListener('click', () => {
            document.getElementById('playerStatsContainer').classList.add('active');
        });

        resetBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(resetBtn)) return;
            if (vars.gameWon) return;
            if (!vars.playerEntryList.length) return;

            vars.currentGameDifficulty = difficultySelect.value==='30' ? 'easy' : difficultySelect.value==='40' ? 'medium' : 'hard';
            playerPointsOnWinNum.textContent = difficultySelect.value==='30' ? '50' : difficultySelect.value==='40' ? '100' : '200';

            puzzle = vars.copyGrid(vars.initial);
            notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
            vars.gameWon = false;
            vars.updatePlayerData('played', true); // the player is reseting their current game, so reduce the played var and save

            vars.playerEntryList = [];

            vars.draw();
        });

        solveBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(solveBtn)) return;
            if (vars.gameWon) return;

            puzzle = vars.copyGrid(solution);
            vars.draw();
        });

        undoBtn.addEventListener('click', () => {
            if (!vars.buttonIsEnabled(undoBtn)) return;
            if (vars.gameWon) return;

            vars.undoLastMove();
        });
    },

    initKeyboardEventListeners: ()=> {
        window.addEventListener('keydown', (e) => {
            if (vars.gameWon) return;

            if (noteMode) {
                if (e.key >= '1' && e.key <= '9') {
                    const n = parseInt(e.key);
                    const { r, c } = noteMode;
                    if (notes[r][c].has(n)) notes[r][c].delete(n);
                    else notes[r][c].add(n);
                    vars.draw();
                };
                if (e.key === 'Escape') { noteMode = null; }
                return;
            };

            if (vars.selected.r < 0 || vars.selected.c < 0) return;

            let resetBadArray = false;
            if (e.key >= '1' && e.key <= '9') {
                const n = e.key*1;
                if (vars.initial[vars.selected.r][vars.selected.c] === 0) {
                    puzzle[vars.selected.r][vars.selected.c] = n;
                    notes[vars.selected.r][vars.selected.c].clear();
                };
                resetBadArray = true;
                if (vars.isBonusGame) {
                    vars.localStorage.updateBonusGamePositions(vars.selected.r, vars.selected.c);
                };
                vars.saveUserEntry(vars.selected.r, vars.selected.c, n);
                vars.playerEntryList.length===1 && vars.updatePlayerData('played'); // players first move, save this to games played
                vars.checkForWin();
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                if (vars.initial[vars.selected.r][vars.selected.c] === 0) {
                    puzzle[vars.selected.r][vars.selected.c] = 0;
                    notes[vars.selected.r][vars.selected.c].clear();
                };
                vars.removeUserEntry(vars.selected.r, vars.selected.c);
                resetBadArray = true;
            } else if (e.key === 'ArrowUp') {
                vars.selected.r = (vars.selected.r + 8) % 9;
                selInfo.textContent = `r${vars.selected.r + 1} c${vars.selected.c + 1}`;
                vars.draw(); 
            } else if (e.key === 'ArrowDown') {
                vars.selected.r = (vars.selected.r + 1) % 9;
                selInfo.textContent = `r${vars.selected.r + 1} c${vars.selected.c + 1}`;
                vars.draw(); 
            } else if (e.key === 'ArrowLeft') {
                vars.selected.c = (vars.selected.c + 8) % 9;
                selInfo.textContent = `r${vars.selected.r + 1} c${vars.selected.c + 1}`;
                vars.draw(); 
            } else if (e.key === 'ArrowRight') {
                vars.selected.c = (vars.selected.c + 1) % 9;
                selInfo.textContent = `r${vars.selected.r + 1} c${vars.selected.c + 1}`;
                vars.draw(); 
            };
            
            if (resetBadArray) {
                vars.bad = [];
                vars.draw();
            };
        });
    },

    initMouseEventListeners: ()=> {
        canvas.addEventListener('click', (e) => {
            if (vars.gameWon) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const c = Math.floor(x / cellPx), r = Math.floor(y / cellPx);
            if (r >= 0 && r < 9 && c >= 0 && c < 9) {
                const cellX = x - c * cellPx, cellY = y - r * cellPx;
                if (puzzle[r][c] === 0) {
                    if (cellX < 10 && cellY < 10) {
                        noteMode = { r, c, corner: 1 };
                    } else if (cellX > cellPx - 10 && cellY < 10) {
                        noteMode = { r, c, corner: 2 };
                    } else if (cellX < 10 && cellY > cellPx - 10) {
                        noteMode = { r, c, corner: 3 };
                    } else if (cellX > cellPx - 10 && cellY > cellPx - 10) {
                        noteMode = { r, c, corner: 4 };
                    } else {
                        vars.selected = { r, c };
                        selInfo.textContent = `r${r + 1} c${c + 1}`;
                        noteMode = null;
                    };
                } else {
                    vars.selected = { r, c };
                    selInfo.textContent = `r${r + 1} c${c + 1}`;
                    noteMode = null;
                };
                vars.bad = [];
                vars.draw();
            };
        });

        document.addEventListener('mousedown', (e) => {
            vars.DEBUG && console.log(`button: ${e.button} target: ${e.target.id}`);
            let id = e.target.id;
            if (!id) return;

            switch (e.target.id) {
                case 'hintBtn':
                    if (e.button !== 2) return;

                    vars.giveBetterHint();
                break;

                case 'mainWrapper': case 'mainContainer':
                    vars.resetSelected();
                    vars.showColourOptions(false);
                    vars.showBGImageOptions(false);
                    vars.draw();
                break;
            };
        });
    },

    backtrackFill(grid, idx = 0) {
        if (idx >= vars.cellWidth**2) return true;
        const r = Math.floor(idx / vars.cellWidth), c = idx % vars.cellWidth;
        if (grid[r][c] !== 0) return vars.backtrackFill(grid, idx + 1);
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]; shuffleArray(nums);
        for (const n of nums) {
            if (vars.canPlace(grid, r, c, n)) {
                grid[r][c] = n;
                if (vars.backtrackFill(grid, idx + 1)) return true;
                grid[r][c] = 0;
            };
        };
        return false;
    },

    bonusGameWin: ()=> {
        vars.showBonusMessages(false);

        // which bonus game did the player win?
        let bG = vars.bonusGames;
        if (!bG.bronze.complete) {
            vars.pointsToCount = bG.bronze.bonus;
            bG.bronze.complete = true;
        } else if (!bG.silver.complete) {
            vars.pointsToCount = bG.silver.bonus;
            bG.silver.complete = true;
        } else if (!bG.gold.complete) {
            vars.pointsToCount = bG.gold.bonus;
            bG.gold.complete = true;
            vars.setBonusEndDate();

            //bonusGameButton.classList.remove('active');
            bonusGameButton.classList.add('twoTimesBonus');
        } else {
            let msg = `Error: All bonus games are complete!\n\nSo this was mis-marked as a bonus game!`;
            console.error(msg);
            alert(msg);
            debugger;
        };

        vars.pointsToCount = vars.getBonusPoints();
        // make sure points to count is an integer!
        if (!vars.isInteger(vars.pointsToCount)) {
            let msg = `Error: pointsToCount is not an integer! (${vars.pointsToCount})`;
            console.error(msg);
            alert(msg);
            debugger;
            return;
        };


        vars.showFloatingPoints(vars.pointsToCount);

        let key = vars.localStorage.key;
        localStorage.setItem(`${key}bonusPuzzle`, '');

        // show the points won div again
        playerPointsOnWin.style.display = 'block';

        // reset bonus game status and save
        vars.isBonusGame = false;
        vars.localStorage.saveBonusDetails();
    },

    buttonIsEnabled: (button) => {
        return window.getComputedStyle(button).opacity === "1";
    },

    canPlace: (grid, r, c, n) => {
        for (let i = 0; i < 9; i++) if (grid[r][i] === n || grid[i][c] === n) return false;
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[br + i][bc + j] === n) return false;
        return true;
    },

    checkForWin: ()=> {
        let invalid = vars.cellWidth**2;
        solution.forEach((r,rI)=> {
            r.forEach((c,cI)=> {
                c===puzzle[rI][cI] && (invalid--);
            });
        });

        if (!invalid) {
            vars.gameWon = true;
            vars.updatePlayerData('win'); // the player has won, so increase the won var and save
            vars.updatePlayerAndColourUI(); // update the colour and level
            setTimeout(() => {
                vars.winAnimationRunning = true;

                vars.gameWon = true;
                vars.selected = { r: -1, c: -1 }; // deselect the last placed position

                vars.draw();

                // get points won and start adding them to the player's score
                if (vars.isBonusGame) {
                    vars.bonusGameWin();
                } else {
                    vars.pointsToCount = playerPointsOnWinNum.innerText*1;
                    vars.bonusPointsEnabled && (vars.pointsToCount *= 2);
                    vars.showFloatingPoints(vars.pointsToCount);

                    vars.bonusGames.checkForBonusGame();
                };

                vars.disableButtonsAfterWin(true);

                vars.doWinAnimation();
                vars.showFireworks();

                vars.startAddingScore();
                vars.bonusGames.drawBonusPips();

            }, 100);
        };
    },

    checkPuzzleDifficulty: ()=> {
        if (vars.currentGameDifficulty!=='medium') { return `Not medium difficulty. Ignoring`; };
        vars.DEBUG && console.log(`%cChecking puzzles difficulty...`,`color: ${vars.textColour}; font-weight: bold;`);

        let positionData = [];
        let problemAreas = [];
        for (let a = 0; a<9; a++) {
            let data = vars.getSudokuBlockFreeCount(a);
            positionData.push(data);
            if (data.free>=8) {
                vars.DEBUG && console.log(`Problem with area ${a}`);
                problemAreas.push({area: a, data: data});
            };
        };

        // do we have any problem areas?
        if (!problemAreas.length) {
            vars.DEBUG && console.log(`  %c- No problem areas found. Puzzle is valid.`,`color: ${vars.textColour}; font-weight: bold;`);
            return 'Valid';
        };

        let nI = -Infinity;
        let data = [];
        positionData.forEach((p,i)=> {
            if (9-p.free > nI) {
                nI = 9-p.free;
                data = p;
            };
        });
        
        let selectedIndex = rnd(0,data.taken.length-1);
        let sel = data.taken[selectedIndex];
        let r = sel.r;
        let c = sel.c;
        vars.DEBUG && console.log(`Removing value at r${r} c${c} from puzzle. As it only had ${data.free} position${data.free>1 ? 's' : ''} free.`);
        puzzle[r][c] = 0; // remove the value
        
        // now select a random empty position from the problem area and place the value there
        data = problemAreas[0].data.positionsAvailable;
        let selectedPosIndex = rnd(0, data.length-1);
        let selPos = data[selectedPosIndex];
        let newR = selPos.r;
        let newC = selPos.c;
        let value = solution[newR][newC];
        puzzle[newR][newC] = value;
        vars.DEBUG && console.log('Problem Data:',data);
        vars.DEBUG && console.log(`Placing value ${value} at r${newR} c${newC} instead which has ${data.length} positions free.`);

        vars.checkPuzzleDifficulty();
    },

    copyGrid: (g) => {
        return g.map(r => r.slice());
    },

    countSolutions: (grid, limit = 2) => {
        const g = vars.copyGrid(grid);
        let count = 0;
        function solve() {
            if (count >= limit) return;
            let rr = -1, cc = -1, found = false;
            for (let i = 0; i < 9 && !found; i++) for (let j = 0; j < 9; j++) if (g[i][j] === 0) { rr = i; cc = j; found = true; break; }
            if (!found) { count++; return; }
            for (let n = 1; n <= 9; n++) {
                if (vars.canPlace(g, rr, cc, n)) {
                    g[rr][cc] = n;
                    solve();
                    g[rr][cc] = 0;
                    if (count >= limit) return;
                };
            };
        };
        solve();
        return count;
    },

    disableButtonsAfterWin: (disable=true) => {
        checkBtn.style.opacity = disable ? 0.3 : 1;
        hintBtn.style.opacity = disable ? 0.3 : 1;
        resetBtn.style.opacity = disable ? 0.3 : 1;
        solveBtn.style.opacity = disable ? 0.3 : 1;
        undoBtn.style.opacity = disable ? 0.3 : 1;
    },

    disableSolutionButton: (disable=true) => {
        solveBtn.style.opacity = disable ? 0.3 : 1;
    },

    doWinAnimation: ()=> {
        let animationType = rnd(['ScaleUpScaleDown','ScaleDown']);
        let entries = vars.playerEntryList;
        let startValue = 43;
        let startDirection = 1;
        let delayMult = 3;
        if (animationType==='ScaleDown') {
            entries.reverse();
            startValue = 83;
            startDirection = -1;
            delayMult = 3;
        };
        entries.forEach((entry,eI)=> {
            let data = { value: startValue, min: 43, max: 103, inc: 2*startDirection, complete: false, r: entry.r, c: entry.c, number: entry.n, delayInFrames: eI*delayMult };
            vars.animationEntries.push(data);
        });


        vars.checkAnimationFinishedInterval = setInterval(()=> {
            // check if the animations are complete
            let stillToFinish = vars.animationEntries.filter(e=>!e.complete);
            if (!stillToFinish.length) { // they are!
                vars.DEBUG && console.log(`Animation complete! Showing the game over message`);
                clearInterval(vars.checkAnimationFinishedInterval);
                delete vars.checkAnimationFinishedInterval;
                vars.winAnimationRunning = false;
                vars.draw();
                return;
            };

            // still waiting on at least one animation to finish
            vars.updateWinTextAnimation();
            vars.draw();
        }, 1000/60);
    },

    draw: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (vars.bad && vars.bad.length) {
            vars.resetSelected();
            for (const p of vars.bad) {
                const x = p.c * cellPx, y = p.r * cellPx;
                ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                ctx.fillRect(x, y, cellPx, cellPx);
            };
        };

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const x = c * cellPx, y = r * cellPx;
                if (vars.selected.r === r && vars.selected.c === c) { // currently selected position
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(x, y, cellPx, cellPx);
                };

                const v = puzzle[r][c];
                if (v !== 0) {
                    if (vars.initial[r][c] !== 0) { // this position wasnt hidden from the user
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `600 ${Math.floor(cellPx * 0.6)}px sans-serif`;
                    } else {  // this position WAS hidden from the user
                        // are we animating the win numbers?
                        let anim = vars.animationEntries.find(a=>a.r===r && a.c===c);
                        let fontSize = !anim ? Math.floor(cellPx * 0.6) : anim.value;
                        ctx.fillStyle = vars.textColour;
                        ctx.font = `500 ${fontSize}px sans-serif`;
                    };
                    ctx.fillText(String(v), x + cellPx / 2, y + cellPx / 2 + 2);
                } else {
                    // Draw note candidates
                    ctx.fillStyle = '#e4e9a1ff';
                    ctx.font = `${Math.floor(cellPx * 0.22)}px sans-serif`;
                    const offsets = [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]];
                    let idx = 0;
                    for (const val of notes[r][c]) {
                        const ox = offsets[idx % 4][0] * cellPx * 0.4;
                        const oy = offsets[idx % 4][1] * cellPx * 0.4;
                        ctx.fillText(String(val), x + cellPx / 2 + ox, y + cellPx / 2 + oy);
                        idx++;
                    };
                };
                // Draw clickable corner highlights (light circles)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath(); ctx.arc(x + 6, y + 6, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + cellPx - 6, y + 6, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 6, y + cellPx - 6, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + cellPx - 6, y + cellPx - 6, 4, 0, Math.PI * 2); ctx.fill();
            };
        };

        for (let i = 0; i <= 9; i++) {
            ctx.beginPath(); ctx.lineWidth = (i % 3 === 0) ? 3 : 1;
            ctx.strokeStyle = (i % 3 === 0) ? 'rgba(180,240,255,0.95)' : 'rgba(180, 255, 214, 0.25)';
            ctx.moveTo(0, i * cellPx); ctx.lineTo(canvas.width, i * cellPx); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(i * cellPx, 0); ctx.lineTo(i * cellPx, canvas.height); ctx.stroke();
        };

        if (vars.gameWon && !vars.winAnimationRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.925)';
            ctx.fillRect(0, canvas.height / 2 - 330, canvas.width, 660);
            ctx.fillStyle = vars.textColour;
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText('SUDOKU SOLVED!', canvas.width / 2, canvas.height / 2 + 2);
        };
    },

    findConflicts: (g) => {
        const bad = [];
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
            const v = g[r][c]; if (v === 0) continue;
            g[r][c] = 0; const ok = vars.canPlace(g, r, c, v); g[r][c] = v; if (!ok) bad.push({ r, c });
        };
        return bad;
    },

    generateFull: ()=> {
        let attempts = 0;
        while (attempts < 100) {
            const g = vars.makeEmptyGrid();
            if (vars.backtrackFill(g, 0)) return g;
            attempts++;
        }
        throw new Error("Failed to generate full Sudoku board after many attempts");
    },

    /*
        These functions are used after a new puzzle has been created on MEDIUM difficulty only.
        Theres a low chance that the backwards solver will reduce a single 3x3 area to only show a single number, making the puzzle slightly more difficult to solve.
        This is used to find a group that has a lot of filled cells. It will then remove a number in that group and show another number in the group that only had one cell revealed.
        Bringing the overall difficulty down slightly.
    */
    getSudokuBlockFreeCount: (areaIndex) => {
        let freeCount = 0;
        let positionData = { free: 0, positionsAvailable: [], taken: [] };
        let indexes = vars.getSudokuBlockIndexes(areaIndex);

        indexes.forEach(pos=> {
            let r = pos[0];
            let c = pos[1];
            if (puzzle[r][c]===0) {
                freeCount++;
                positionData.positionsAvailable.push({r: r, c: c});
            } else {
                positionData.taken.push({r: r, c: c, value: puzzle[r][c]}) ;
            };
            positionData.free = freeCount;
        });

        return positionData;
    },

    getSudokuBlockIndexes: (areaIndex) => {
        if (areaIndex < 0 || areaIndex > 8) {
            throw new Error("Area index must be between 0 and 8");
        };

        const block = [];

        // Each block is arranged in a 3x3 grid of blocks
        const blockRow = Math.floor(areaIndex / 3); // 0,1,2
        const blockCol = areaIndex % 3;             // 0,1,2

        // Loop inside the 3x3 block
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const row = blockRow * 3 + r;
                const col = blockCol * 3 + c;
                block.push([row, col]);
            };
        };

        return block;
    },

    getBonusPoints: (remove=0)=> {
        let pointsDiv = document.getElementById('bonusPointsCount');
        let pointsText = pointsDiv.textContent;
        let newPoints = /([0-9]){3}/.exec(pointsText)[0]*1-remove;
        pointsDiv.textContent = `BONUS: ${newPoints} points`;
        return newPoints;
    },

    getColourBandFromPlayerLevel: ()=> {
        let level = vars.playerLevel;
        let diamondLevelStart = vars.diamondLevelStart;

        let levelColours = ['BRONZE','SILVER','GOLD','PLATINUM','PEARL','DIAMOND'];
        
        let cI = Clamp(level/100|0,0,levelColours.length-1);
        let colour = levelColours[cI];
        let cL = Math.ceil(level/10)%10 +1;

        let ext = '';
        if (diamondLevelStart && level>=diamondLevelStart) {
            ext = level - diamondLevelStart;
            ext=Math.floor(ext/100);
            ext +=1;
            ext = ` ${ext}`;
        };

        return { colour: colour+ext, level: cL, playerLevel: level };
    },

    getCurrentBonusLevel: ()=> {
        let bG = vars.bonusGames;
        return !bG.bronze.complete ? 'bronze' : !bG.silver.complete ? 'silver' : !bG.gold.complete ? 'gold' : null;
    },

    getCurrentPointsAsPercentage: ()=> {
        return 100-(vars.pointsUntilNextLevel/vars.pointsUntilNextLevelMax*100)|0;
    },
    
    getDiamondStartLevel: ()=> {
        let diamondLevelStart = 0;
        let levelColours = ['BRONZE','SILVER','GOLD','PLATINUM','PEARL','DIAMOND'];
        for (let level=0; level<=1200; level+=10) {
            if (diamondLevelStart) break;
            let cI = Clamp(level/100|0,0,levelColours.length-1);
            let colour = levelColours[cI];
            (!diamondLevelStart && colour==='DIAMOND') && (diamondLevelStart = level);
        };

        vars.diamondLevelStart = diamondLevelStart;
    },

    // this runs when "points until next level" reaches 0
    getPointsUntilNextLevel: ()=> {
        let key = vars.localStorage.key;

        vars.pointsUntilNextLevel = 90+(5*(1.5*vars.playerLevel)|0);
        vars.pointsUntilNextLevelMax = vars.pointsUntilNextLevel;

        localStorage.setItem(key+'pointsUntilNextLevel', vars.pointsUntilNextLevel);
        localStorage.setItem(key+'pointsUntilNextLevelMax', vars.pointsUntilNextLevelMax);

        return vars.pointsUntilNextLevel;
    },

    giveBetterHint: ()=> {
        let mult = vars.currentGameDifficulty === 'hard' ? 4 : 1;
        if (playerPointsOnWinNum.innerText*1<=10*mult) return; // no more hints allowed

        vars.DEBUG && console.log(`giveBetterHint()`);
        let largeR = 0;
        let lines = {
            r: [],
            c: []
        }
        puzzle.forEach((r,rI) => {
            let emptyCount = 0
            let emptyPositions = [];
            r.forEach((c,cI) => {
                if (!c) {
                    emptyCount++;
                    emptyPositions.push({r: rI, c: cI});
                };
            });

            lines.r.push({ row: rI+1, empty: emptyCount, emptyPositions: emptyPositions });
            emptyCount > largeR && (largeR = emptyCount);
        });

        lines.r = lines.r.filter(r=>r.empty===largeR)


        let largeC = 0;
        for (let c=0; c<vars.cellWidth; c++) {
            let emptyCount = 0;
            let emptyPositions = [];
            for (let r=0; r<vars.cellWidth; r++) {
                let v = puzzle[r][c];
                if (!v) {
                    emptyCount++;
                    emptyPositions.push({r: r, c: c});
                };
            };
            lines.c.push({ col: c+1, empty: emptyCount, emptyPositions: emptyPositions });
            emptyCount > largeC && (largeC = emptyCount);
        };

        lines.c = lines.c.filter(c=>c.empty===largeC)

        if (vars.DEBUG) {
            console.log(lines);
            console.log(`R: ${largeR} C: ${largeC}`);
        };

        let selectedPosition = [];
        let selectedDirection = '';
        if (largeC>largeR) {
            vars.DEBUG && console.log(`A column has a larger amount of empty positions`);
            selectedDirection = 'c';
            selectedPosition = shuffleArray(lines.c)[0];
        } else if (largeR>largeC) {
            vars.DEBUG && console.log(`A row has a larger amount of empty positions`);
            selectedDirection = 'r';
            selectedPosition = shuffleArray(lines.r)[0];
        } else {
            vars.DEBUG && console.log(`Both cols and rows have an equal amount of empty positions`);
            selectedDirection = !rnd(0,1) ? 'r' : 'c';
            selectedPosition = shuffleArray(lines[selectedDirection])[0];
        };
        vars.DEBUG && console.log(`Selected direction: ${selectedDirection}`, selectedPosition);

        const { r, c } = shuffleArray(selectedPosition.emptyPositions)[0];
        puzzle[r][c] = solution[r][c];
        notes[r][c].clear();

        vars.reducePointsForWin();

        vars.draw();
    },

    giveHint: ()=> {
        let mult = vars.currentGameDifficulty === 'hard' ? 4 : 1;
        if (playerPointsOnWinNum.textContent*1<=10*mult) return; // no more hints allowed
        // is there a highlighted empty position?
        if (vars.selected.r >= 0 && vars.selected.c >= 0) {
            const { r, c } = vars.selected;
            if (puzzle[r][c] === 0) { // is it empty?
                puzzle[r][c] = solution[r][c];
                notes[r][c].clear();
                vars.reducePointsForWin();
                vars.draw();
                return;
            };
        };

        const empties = [];
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (puzzle[r][c] === 0) empties.push({ r, c });
        if (empties.length === 0) { alert('No empty cells left'); return; };

        const idx = Math.floor(Math.random() * empties.length);
        const { r, c } = empties[idx];
        puzzle[r][c] = solution[r][c];
        notes[r][c].clear();

        vars.reducePointsForWin();

        vars.draw();
    },

    help: {
        hideAll: ()=> {
            document.querySelectorAll('.helpPage').forEach(d=>(d.style.transform = 'translateX(100vw)', d.style.display = 'none'));
        },

        showPage: (pageId)=> {
            vars.help.hideAll();
            let div = document.querySelector(`div[data-help-page="${pageId}"]`);
            div.style.display = 'flex';
            setTimeout(()=> {
                div.style.transition = '333ms';
                div.style.transform = 'translateX(0)';
            },0);

            document.querySelectorAll(`div[data-help-show]`).forEach(d=>d.classList.remove('helpButtonSelected')); // remove all selected classes
            let buttonDiv = document.querySelector(`div[data-help-show="${pageId}"]`);  // find the button that opened this page
            buttonDiv.classList.add('helpButtonSelected');                              // and highlight it
        }
    },

    hideAllOptionContainers: ()=> {
        vars.showColourOptions(false);
        vars.showBGImageOptions(false);
    },

    hideLoadingScreen: ()=> {
        let container = document.getElementById('loadingScreenContainer');
        container.classList.add('fadeout');
        setTimeout(()=> {
            container.style.display = 'none';
        },1100)
    },

    isInteger: (number)=> {
        return Number.isInteger(number);
    },

    makeEmptyGrid: () => {
        return new Array(9).fill(0).map(() => new Array(9).fill(0));
    },
    
    makePuzzleFromSolution: (full, targetEmpty) => {
        let g = vars.copyGrid(full);
        const cells = []; for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push({ r, c });
        shuffleArray(cells);
        let removed = 0;
        for (const cell of cells) {
            if (removed >= targetEmpty) break;
            const { r, c } = cell; const backup = g[r][c]; g[r][c] = 0;
            const sols = vars.countSolutions(g, 2);
            if (sols !== 1) { g[r][c] = backup; } else { removed++; }
        };
        return g;
    },

    newPuzzle: () => {
        vars.gameWon = false;

        vars.animationEntries = [];
        vars.playerEntryList = [];
        vars.showFireworks(false);

        vars.isBonusGame ? vars.showBonusMessages(true) : vars.showBonusMessages(false);

        vars.currentGameDifficulty = difficultySelect.value==='30' ? 'easy' : difficultySelect.value==='40' ? 'medium' : 'hard';
        playerPointsOnWinNum.textContent = difficultySelect.value==='30' ? '50' : difficultySelect.value==='40' ? '100' : '200';

        if (vars.isBonusGame) {
            playerPointsOnWin.style.display = 'none';

            let key = vars.localStorage.key;
            let bonusGameDetails = localStorage.getItem(`${key}bonusPuzzle`);

            if (bonusGameDetails) { // does a bonus puzzle with the current difficulty exist?
                bonusGameDetails = JSON.parse(bonusGameDetails);
                if (bonusGameDetails[vars.currentGameDifficulty]) { // YES!
                    bonusGameDetails = bonusGameDetails[vars.currentGameDifficulty];
                    puzzle = bonusGameDetails.puzzle;
                    solution = bonusGameDetails.solution;
                    vars.initial = vars.copyGrid(puzzle);
                    notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
                    vars.resetSelected();

                    playerPointsOnWinNum.textContent = bonusGameDetails.playerPointsOnWin;

                    bonusGameDetails.positions.forEach((p)=> {
                        const { r, c } = p;
                        puzzle[r][c] = solution[r][c];
                        let loadedFromBonusPuzzle = true;
                        vars.saveUserEntry(r, c, solution[r][c], loadedFromBonusPuzzle);

                        if (vars.playerEntryList.length===1) {
                            vars.updatePlayerData('played'); // players first move, save this to games played
                        };
                    });

                    vars.draw();

                    return;
                };                
            };
        };

        const empties = difficultySelect.value*1;
        solution = vars.generateFull();
        puzzle = vars.makePuzzleFromSolution(solution, empties);
        vars.checkPuzzleDifficulty();
        vars.initial = vars.copyGrid(puzzle);
        notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
        
        vars.resetSelected();
        
        if (vars.isBonusGame) { // if we get here the bonus game details for the current difficulty DO NOT exist, so we need to create them
            let bonusGameDetails = {};
            bonusGameDetails[vars.currentGameDifficulty] = {
                puzzle: puzzle,
                solution: solution,
                hintsUsed: 0,
                playerPointsOnWin: vars.getBonusPoints(),
                positions: [],
            };

            let key = vars.localStorage.key;
            let existingDetails = localStorage.getItem(`${key}bonusPuzzle`);
            if (existingDetails) {
                existingDetails = JSON.parse(existingDetails);
                bonusGameDetails = { ...existingDetails, ...bonusGameDetails };
            };

            bonusGameDetails = JSON.stringify(bonusGameDetails);
            localStorage.setItem(`${key}bonusPuzzle`, bonusGameDetails);
        };

        vars.draw();
    },

    reducePointsForWin: ()=> {
        let remove = 0;
        switch (vars.currentGameDifficulty) {
            case 'easy': remove = 2; break;
            case 'medium': remove = 10; break;
            case 'hard': remove = 40; break;
        };
        playerPointsOnWinNum.textContent = Math.max(0, (playerPointsOnWinNum.textContent*1)-remove);

        vars.updatePlayerData('hint');

        if (!vars.isBonusGame) return;

        vars.getBonusPoints(remove);

        vars.localStorage.updateBonusGamePointsForWin();
    },

    removeUserEntry: (r, c) => {
        if (!vars.playerEntryList.length) return;

        vars.playerEntryList = vars.playerEntryList.filter(e=>!(e.r===r && e.c===c));
        !vars.playerEntryList.length && vars.updatePlayerData('played', true);
    },

    resetSelected: ()=> {
        vars.selected = { r: -1, c: -1 };
        selInfo.textContent = 'none';
    },

    saveUserEntry: (r, c, n, loadedFromBonusPuzzle=false) => {
        !loadedFromBonusPuzzle && vars.removeUserEntry(r, c); // make sure the entry doesnt already exist
        vars.playerEntryList.push({ r, c, n });
    },

    setBackgroundImage: (clear=false)=> {
        let bg = vars.backgroundImage;
        let div = document.getElementById('mainContainer');
        div.style.backgroundImage = clear || bg==='none' ? 'none' : `url('./images/backgrounds/${bg}.jpg')`;

        clear && (vars.backgroundImage = 'none');

        vars.localStorage.saveBGImage();
    },

    setBonusEndDate: ()=> {
        vars.bonusPointsEnabledUntil = new Date();
        vars.bonusPointsEnabledUntil.setDate(vars.bonusPointsEnabledUntil.getDate() + 7);
        vars.bonusPointsEnabledUntil = vars.bonusPointsEnabledUntil.toISOString().slice(0,10).replace(/-/g,'');

        let key = vars.localStorage.key;
        localStorage.setItem(key+'bonusPointsEnabledUntil', vars.bonusPointsEnabledUntil);
        localStorage.setItem(key+'bonusPointsEnabled', 'true');
    },

    showAnimatedWallpaper: (show=true, changeImage=false)=> {
        let ImageFieldClass = vars.ImageFieldClass;
        let div = document.getElementById('animatedWallpaperContainer');
        if (!show) { // we are hiding the animated wallpaper
            div.classList.remove('active');
            ImageFieldClass.stop();
            return;
        };

        div.classList.add('active');
        // get the animated wallpaper
        let aWType = vars.animatedBackgroundOptions[vars.animatedBackgroundSelectedIndex];

        let imageName = `./images/backgroundPieces/${aWType}_x84.png`;
        changeImage && ImageFieldClass._changeImage(imageName, 84);
        ImageFieldClass.animate();
    },

    showBGImageOptions: (show=true)=> {
        let div = document.getElementById('bgImageOptions');
        show ? div.classList.remove('hidden') : div.classList.add('hidden');
    },

    showBonusMessages: (show=true)=> {
        [...document.getElementsByClassName('bonusGame')].forEach((t)=> { show ? t.classList.remove('hidden') : t.classList.add('hidden') });
    },

    showColourOptions: (show=true)=> {
        let div = document.getElementById('colourOptions');
        show ? div.classList.remove('hidden') : div.classList.add('hidden');
    },

    showFireworks: (show=true)=> {
        let container = document.getElementById('fireworksContainer');
        if (show) {
            vars.classFireworks.start();
            container.classList.add('active');
            return;
        } else {
            container.classList.remove('active');
            setTimeout(()=> {
                vars.classFireworks.stop();
            }, 1100);
        };
        
    },

    showFloatingPoints(points=null) {
        if (document.querySelector('#floatingPoints.show') || !points) {
            let msg = !points ? 'No points sent to function. Ignoring call' : 'Already animating. Request ignored.';
            console.warn(msg);
            return;
        };

        let div = document.getElementById('floatingPoints');
        div.innerHTML = `+${points} points!`;

        div.classList.add('show');

        setTimeout(()=> {
            div.classList.remove('show');
        }, 3500);
    },

    showHelpContainer: (show=true)=> {
        let container = document.getElementById('helpContainer');
        show ? container.classList.add('active') : container.classList.remove('active');
    },

    startAddingScore: ()=> {
        if (!vars.pointsToCount) {
            vars.audio.stop('pointsIncrease');
            vars.updatePlayerDataUI();
            return;
        };

        vars.audio.play('pointsIncrease');

        let remove = 1; //(vars.pointsToCount+100)/100|0;
        vars.pointsToCount-=remove;
        vars.playerPoints+=remove;
        vars.pointsUntilNextLevel-=remove;

        // convert points into a percentage for use with the LevelAndPointsClass
        let percent = vars.getCurrentPointsAsPercentage();
        vars.LevelAndPointsClass.draw(vars.playerLevel, percent);

        document.getElementById('playerPointsNum').textContent = vars.playerPoints;
        document.getElementById('pointsUntilNextLevelNum').textContent = vars.pointsUntilNextLevel;

        if (!vars.pointsUntilNextLevel) {
            vars.playerLevel++;
            vars.audio.play('gainLevel');

            vars.getPointsUntilNextLevel();
            document.getElementById('playerLevelNum').textContent = vars.playerLevel;
            document.getElementById('pointsUntilNextLevelNum').textContent = vars.pointsUntilNextLevel; // reset to new value
        };

        if (!vars.pointsToCount) {
            vars.DEBUG && console.log(`%cFinished adding score. Saving to local storage`, 'font-weight: bold; color: #30ff30;');
            vars.audio.stop('pointsIncrease');

            let key = vars.localStorage.key;

            localStorage.setItem(key+'level', vars.playerLevel);
            localStorage.setItem(key+'points', vars.playerPoints);
            localStorage.setItem(key+'pointsUntilNextLevel', vars.pointsUntilNextLevel);
            localStorage.setItem(key+'pointsUntilNextLevelMax', vars.pointsUntilNextLevelMax);

            vars.updatePlayerDataUI();

            // show the player data container if the players level or colour has changed
            if (!vars.animate.showNewLevel) return;

            vars.animate.colourAndLevelUp();
        };

        setTimeout(()=> {
            vars.startAddingScore();
        }, 1000/60);
    },

    switchBGOptionsVisibility: ()=> {
        document.getElementById('bgImageOptions').classList.toggle('hidden');
    },

    switchColourOptionsVisibility: ()=> {
        document.getElementById('colourOptions').classList.toggle('hidden');
    },

    switchToAnimatedWallpaper: (enable=true, changeImage=false)=> {
        let clear = enable;
        clear && vars.setBackgroundImage(clear);
        localStorage.setItem(vars.localStorage.key+'animatedBackgroundIndex', vars.animatedBackgroundSelectedIndex);
        vars.showAnimatedWallpaper(enable, changeImage);
    },

    switchToBackgroundType: (bgType, which)=> {
        let allowed = ['animated','positioned','texture'];
        if (!allowed.includes(bgType)) {
            console.warn(`Unknown background type: ${bgType}. Ignoring request.`);
            return;
        };

        if (bgType==='animated' && which<0 || which>=vars.animatedBackgroundOptions.length) {
            console.warn(`Animated background index out of range: ${which}. Ignoring request.`);
            return;
        } else if (bgType==='positioned' && !vars.positionedImageClass.checkIfValid(which)) {
            console.warn(`Positioned background name not found: ${which}. Ignoring request.`);
            return;
        } else if (bgType==='texture' && !vars.images.isValid(which)) {
            console.warn(`Texture background name not found: ${which}. Ignoring request.`);
            return;
        };

        vars.showAnimatedWallpaper(false); // hide the animated wallpaper
        vars.setBackgroundImage(true); // clear the background image
        vars.switchToPositionedImage('none');

        vars.backgroundType = bgType;
        localStorage.setItem(vars.localStorage.key+'backgroundType', vars.backgroundType);

        switch (bgType) {
            case 'animated':
                vars.animatedBackgroundSelectedIndex = which;
                vars.switchToAnimatedWallpaper(true, true);
            break;

            case 'positioned':
                vars.switchToPositionedImage(which);
            break;

            case 'texture':
                vars.backgroundImage = which;
                vars.setBackgroundImage();
            break;
        };
    },

    switchToPositionedImage: (imageName)=> {
        vars.positionedImage = imageName;
        localStorage.setItem(vars.localStorage.key+'positionedImage', vars.positionedImage);
        vars.positionedImageClass.setImageAndData(vars.positionedImage);
    },

    undoLastMove: ()=> {
        if (vars.gameWon) return;
        if (!vars.playerEntryList.length) return;

        let last = vars.playerEntryList.pop();
        const { r, c } = last;
        puzzle[r][c] = 0;
        notes[r][c].clear();
        vars.bad = [];

        if (!vars.playerEntryList.length) vars.updatePlayerData('played',true); // we have reset to no moves taken, so reduce the played count by 1

        vars.draw();
    },

    updateCheckButtonText: ()=> {
        if (checkBtn.innerHTML==='Check <i class="fa-solid fa-circle-check"></i>') return;

        checkBtn.innerHTML = 'Check <i class="fa-solid fa-circle-check"></i>';
        setTimeout(()=> {
            checkBtn.innerHTML = 'Check';
        },3000);
    },

    updateDifficultyColour: (d)=> {
        if (d.value==='50') {
            d.style.backgroundColor = 'rgb(140 0 0)';
        } else if (d.value==='40') {
            d.style.backgroundColor = 'rgb(160 80 0)';
        } else if (d.value==='30') {
            d.style.backgroundColor = 'rgb(0 140 0)';
        };
    },

    updatePlayerAndColourUI: ()=> {
        let band = vars.getColourBandFromPlayerLevel();
        let newText = `${band.colour} LEVEL ${band.level}`;
        let div = document.getElementById('playerColourAndLevel');
        if (div.innerHTML===newText) return; // no change

        // if we get here, there is a level/colour change
        div.innerHTML!=='' && (vars.animate.showNewLevel = true);
        div.innerHTML = newText;
        div.style.backgroundImage = `url("./images/colourLevel_${band.colour}.png")`;
    },

    updatePlayerData: (which, reduce=false) => {
        let difficulty = vars.currentGameDifficulty;
        let playerData = vars.playerData;
        switch (which) {
            case 'hint':
                playerData[difficulty].hints++;
                vars.DEBUG && console.log(`Hint used. Total hints for ${difficulty}: ${playerData[difficulty].hints}`);
            break;
            case 'played':
                !reduce ? (playerData[difficulty].played++) : (playerData[difficulty].played = Clamp(playerData[difficulty].played-1, 0, Infinity));
                vars.DEBUG && console.log(`Game played. Total games for ${difficulty} difficulty: ${playerData[difficulty].played}`);
            break;

            case 'win':
                playerData[difficulty].won++;
                vars.DEBUG && console.log(`Game won. Total wins for ${difficulty}: ${playerData[difficulty].won}`);
            break;

            default:
                return;
            break;
        };
        
        vars.localStorage.saveUpdatedPlayerData();
        vars.updatePlayerDataUI();
    },

    updatePlayerDataUI: ()=> {
        let vPD = vars.playerData;
        for (let difficulty in vPD) {
            let played = vPD[difficulty]['played'];
            let winCount = vPD[difficulty]['won'];
            let percentage = played ? ((winCount/played)*100).toFixed(1) : '0.0';
            let div = document.querySelector(`#gamesPlayed .stats${difficulty.capitalise()}`);
            div && (div.innerText = played);

            div = document.querySelector(`#gamesWon .stats${difficulty.capitalise()}`);
            div && (div.innerText = winCount);

            div = document.querySelector(`#winPercentage .stats${difficulty.capitalise()}`);
            div && (div.innerText = `${percentage}%`);

            div = document.querySelector(`#hintsUsed .stats${difficulty.capitalise()}`);
            div && (div.innerText = vPD[difficulty]['hints']);
        };

        document.querySelector('#totalPoints').innerText = vars.playerPoints;
        document.querySelector('#currentLevel').innerText = vars.playerLevel;
    },

    updateWinTextAnimation: ()=> {
        let eD = vars.animationEntries;
        eD.forEach((e)=> {
            if (e.delayInFrames > 0) {
                e.delayInFrames--;
                return;
            };
            e.value += e.inc;
            if (e.value >= e.max) {
                e.inc *= -1;
                e.value = e.max;
            } else if (e.value <= e.min) {
                e.complete = true;
                e.value = e.min;
            };
        });
    }
};

function backgroundColourChange(which) {
    let bg = '';
    let buttonBG = '';
    let accent = '';
    switch (which) {
        case 'blue':
            bg = '#0f1724';
            buttonBG = '#306e91'
            accent = vars.textColour = '#30a2ff'
        break;

        case 'green':
            bg = '#0f2423';
            buttonBG = '#359130'
            accent = vars.textColour = '#06d474'
        break;

        case 'orange':
            bg = '#24190f';
            buttonBG = '#a66e00'
            accent = vars.textColour = '#ffb930'
        break;

        case 'red':
            bg = '#240f0f';
            buttonBG = '#5b1a1a'
            accent = vars.textColour = '#ff3030'
        break;

        case 'pink':
            bg = '#704777';
            buttonBG = '#a8325c'
            accent = vars.textColour = '#ff30a2'
        break;

        case 'purple':
            bg = '#200f24';
            buttonBG = '#532171'
            accent = vars.textColour = '#d130ff'
        break;

        default:
            bg = '#0f2423';
            buttonBG = '#359130'
            accent = vars.textColour= '#06d474'
        break;
    };

    vars.bgTint = bg;

    backgroundColourRemoveSelected();
    if (which==='default') which = 'green'; // default is green
    document.getElementById(`colour${which.charAt(0).toUpperCase()+which.slice(1)}`).classList.add('selectedColour');

    canvas.style.background = bg;
    let mC = document.getElementById('mainContainer');
    mC.style.backgroundColor = bg;

    const root = document.documentElement;
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--button-bg', buttonBG);
    root.style.setProperty('--accent', accent);

    vars.localStorage.saveColourScheme(which);

    vars.draw(); // update text colour
};
function backgroundColourRemoveSelected() {
    document.querySelector('.selectedColour')?.classList.remove('selectedColour');
};
document.getElementById('colourBlue').addEventListener('click', (e)=> {
    backgroundColourChange('blue');
});
document.getElementById('colourGreen').addEventListener('click', ()=> {
    backgroundColourChange('green');
});
document.getElementById('colourOrange').addEventListener('click', ()=> {
    backgroundColourChange('orange');
});
document.getElementById('colourPink').addEventListener('click', ()=> {
    backgroundColourChange('pink');
});
document.getElementById('colourPurple').addEventListener('click', ()=> {
    backgroundColourChange('purple');
});
document.getElementById('colourRed').addEventListener('click', ()=> {
    backgroundColourChange('red');
});


// get all buttons and drop downs
let backgroundImagesButton = document.getElementById('backgroundImagesButton');
let bonusGameButton = document.getElementById('bonusGameButton');
let checkBtn = document.getElementById('checkBtn');
let closeStatsBtn = document.getElementById('closePlayerStats');
let colourSettingsButton = document.getElementById('colourSettingsButton');
let difficultySelect = document.getElementById('difficulty');
let exitCancelButton = document.getElementById('exitCancel');
let exitOKButton = document.getElementById('exitOK');
let helpButton = document.getElementById('helpButton');
let hintBtn = document.getElementById('hintBtn');
let newBtn = document.getElementById('newBtn');
let playerPointsOnWinNum = document.getElementById('playerPointsOnWinNum');
let playerDetailsButton = document.getElementById('playerDetailsButton');
let resetBtn = document.getElementById('resetBtn');
let selInfo = document.getElementById('selInfo');
let solveBtn = document.getElementById('solveBtn');
let undoBtn = document.getElementById('undoBtn');

// set up the canvas
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const cellPx = canvas.width / vars.cellWidth;

// build a puzzle
vars.initial = vars.makeEmptyGrid();
let puzzle = vars.makeEmptyGrid();
let solution = vars.makeEmptyGrid();

// and add the notes array
let notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));

let noteMode = null;


vars.init();