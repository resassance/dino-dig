import { Game } from './core/Game.js';
import { Museum } from './core/Museum.js';
import { LevelMap } from './core/LevelMap.js';

const canvas = document.getElementById('gameCanvas');
const museum = new Museum();
const game = new Game(canvas, museum);
const levelMap = new LevelMap((levelNumber) => game.jumpToLevel(levelNumber));
game.setLevelMap(levelMap);

const btnNavGame = document.getElementById('btnNavGame');
const btnNavMap = document.getElementById('btnNavMap');
const btnNavMuseum = document.getElementById('btnNavMuseum');
const gameScreen = document.getElementById('gameScreen');
const mapScreen = document.getElementById('mapScreen');
const museumScreen = document.getElementById('museumScreen');

function openGame() {
    btnNavGame?.classList.add('active');
    btnNavMap?.classList.remove('active');
    btnNavMuseum?.classList.remove('active');
    gameScreen?.classList.remove('hidden');
    mapScreen?.classList.add('hidden');
    museumScreen?.classList.add('hidden');
}

function openMap() {
    btnNavMap?.classList.add('active');
    btnNavGame?.classList.remove('active');
    btnNavMuseum?.classList.remove('active');
    mapScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    museumScreen?.classList.add('hidden');
    levelMap.render();
}

function openMuseum() {
    btnNavMuseum?.classList.add('active');
    btnNavGame?.classList.remove('active');
    btnNavMap?.classList.remove('active');
    museumScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    mapScreen?.classList.add('hidden');
    museum.render();
}

btnNavGame?.addEventListener('click', openGame);
btnNavMap?.addEventListener('click', openMap);
btnNavMuseum?.addEventListener('click', openMuseum);

window.addEventListener('switchTab', (e) => {
    if (e.detail === 'museum') {
        openMuseum();
    } else if (e.detail === 'game') {
        openGame();
    } else if (e.detail === 'map') {
        openMap();
    }
});
