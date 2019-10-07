import './index.css';
import createPhysics from './game/game.js';
import { createRenderer, render } from './game/render.js';


const DEBUG_RENDER = false;

let {
    cables,
    player,
    machines,
    plugs,
    tick,
    canvas
} = createPhysics(DEBUG_RENDER, document.getElementById('game'));

if (!DEBUG_RENDER) {
    let renderCanvas = createRenderer();
    document.getElementById('game').appendChild(renderCanvas);
    render(player, cables, machines, plugs, tick);
}
