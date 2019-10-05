import './index.css';
import create from './game';

let { pause } = create(document.getElementById('game'));

// document.getElementById('game').appendChild(GameView);