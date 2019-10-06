
import { WORLD } from './config';
import { Application, Sprite, Point, Graphics } from 'pixi.js';
import earthPNG from '../img/earth.png';

let app;

export const createRenderer = () => {
    app = new Application({
        width: WORLD.WIDTH,
        height: WORLD.HEIGHT,
        backgroundColor: 0x1099bb,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
    });
    app.ticker.speed = 0.5;
    return app.view;
}

const d = (1000 / 30.0);
export const render = (player, cables, machines, plugs, tick) => {
    // players
    let playerSprite = Sprite.from(earthPNG);
    playerSprite.anchor.set(0.5);
    playerSprite.width = 30;
    playerSprite.height = 30;
    playerSprite.position.set(player.position.x, player.position.y);
    app.stage.addChild(playerSprite);

    // cables
    cables.forEach(cable => {
        cable.display = new Graphics();
        app.stage.addChild(cable.display);
    });

    // machines
    machines.forEach(machine => {
        machine.display = Sprite.from(earthPNG);
        machine.display.anchor.set(0.5);
        machine.display.width = 30;
        machine.display.height = 30;
        machine.display.position.set(machine.body.position.x, machine.body.position.y);
        app.stage.addChild(machine.display);
    });

    // machines
    plugs.forEach(plug => {
        plug.display = Sprite.from(earthPNG);
        plug.display.anchor.set(0.5);
        plug.display.width = 30;
        plug.display.height = 30;
        plug.display.position.set(plug.position.x, plug.position.y);
        app.stage.addChild(plug.display);
    });

    app.ticker.add(delta => {
        // player
        playerSprite.position.set(player.position.x, player.position.y);

        // cables
        cables.forEach(cable => {
            cable.display.clear();
            cable.display.lineStyle(10, 0xfff, 1);
            cable.display.moveTo(cable.composite.bodies[0]);
            for (let i = 1; i < cable.composite.bodies.length; i++) {
                cable.display.lineTo(cable.composite.bodies[i].position.x, cable.composite.bodies[i].position.y);
            }
            cable.display.closePath();
        });

        tick(delta * d);
    });
}