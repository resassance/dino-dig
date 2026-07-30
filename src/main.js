import { Game } from './core/Game.js';
import { Museum } from './core/Museum.js';

const canvas = document.getElementById('gameCanvas');
const museum = new Museum();
const game = new Game(canvas, museum);

const btnNavGame = document.getElementById('btnNavGame');
const btnNavMuseum = document.getElementById('btnNavMuseum');
const gameScreen = document.getElementById('gameScreen');
const museumScreen = document.getElementById('museumScreen');

function openGame() {
    btnNavGame?.classList.add('active');
    btnNavMuseum?.classList.remove('active');
    gameScreen?.classList.remove('hidden');
    museumScreen?.classList.add('hidden');
}

function openMuseum() {
    btnNavMuseum?.classList.add('active');
    btnNavGame?.classList.remove('active');
    museumScreen?.classList.remove('hidden');
    gameScreen?.classList.add('hidden');
    museum.render();
}

btnNavGame?.addEventListener('click', openGame);
btnNavMuseum?.addEventListener('click', openMuseum);

window.addEventListener('switchTab', (e) => {
    if (e.detail === 'museum') {
        openMuseum();
    } else if (e.detail === 'game') {
        openGame();
    }
});