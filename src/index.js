import './index.css';
import createPhysics from './game/game.js';
import { createRenderer, render } from './game/render.js';

let { cables, player, machines, plugs, tick } = createPhysics();

let canvas = createRenderer();
document.getElementById('game').appendChild(canvas);

render(player, cables, machines, plugs, tick);