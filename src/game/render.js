
import { WORLD, MACHINES, PLUGS, PLAYER } from './config';
import { Application, Sprite, Text, TextStyle, Graphics } from 'pixi.js';

import playerPNG from '../img/player.png';
import washer1PNG from '../img/washer1.png';
import washer2PNG from '../img/washer2.png';
import washer3PNG from '../img/washer3.png';
import { createPublicKey } from 'crypto';

const randomWasher = () => {
    let washers = [washer1PNG, washer2PNG, washer3PNG];
    return washers[Math.floor(Math.random() * washers.length)];
}

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
    let playerSprite = Sprite.from(playerPNG);
    playerSprite.anchor.set(0.5);
    playerSprite.width = PLAYER.WIDTH;
    playerSprite.height = PLAYER.HEIGHT;
    playerSprite.rotation = Math.PI / 2;
    playerSprite.position.set(player.position.x, player.position.y);
    app.stage.addChild(playerSprite);

    // cables
    cables.forEach(cable => {
        cable.display = new Graphics();
        app.stage.addChild(cable.display);
    });


    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    });


    // machines
    machines.forEach(machine => {
        const progressB = new Graphics()
        progressB.beginFill(0xDE3249);
        progressB.drawRect(machine.body.position.x - 50, machine.body.position.y + 100, machine.loadProgress, 20);
        progressB.endFill();

        machine.loadsText = new Text(`${machine.loadsWaiting}`, style);
        machine.loadsText.x = machine.body.position.x - 50;
        machine.loadsText.y = machine.body.position.y - MACHINES.HEIGHT / 2;
        app.stage.addChild(machine.loadsText);

        machine.display = Sprite.from(randomWasher());
        machine.display.anchor.set(0.5);
        // machine.display.scale.set(10, 10);
        machine.display.width = MACHINES.WIDTH + 10;
        machine.display.height = MACHINES.HEIGHT + 10;
        machine.display.position.set(machine.body.position.x, machine.body.position.y);

        machine.progressBar = progressB;
        app.stage.addChild(machine.display);
        app.stage.addChild(machine.progressBar);
    });

    // machines
    plugs.forEach(plug => {
        plug.display = new Graphics();
        plug.display.beginFill(0);
        plug.display.drawRect(plug.position.x - PLUGS.WIDTH / 2, plug.position.y - PLUGS.HEIGHT / 2, PLUGS.WIDTH, PLUGS.HEIGHT);
        plug.display.endFill();
        app.stage.addChild(plug.display);
    });

    let pointsText = new Text(`${player.points}`, style);
    pointsText.x = 50;
    pointsText.y = 50;
    app.stage.addChild(pointsText);

    app.ticker.add(delta => {
        // player
        playerSprite.position.set(player.position.x, player.position.y);
        playerSprite.rotation = Math.atan2(player.velocity.y, player.velocity.x) + Math.PI / 2;

        // cables
        cables.forEach(cable => {
            cable.display.clear();
            cable.display.lineStyle(7, 0xfff, 1, 0, false);

            // if it's connected at the front, start with what it's connected to
            if (cable.connectionFront !== null) {
                cable.display.moveTo(cable.connectionFront.body.position.x, cable.connectionFront.body.position.y);
            } else {
                cable.display.moveTo(cable.composite.bodies[0].position.x, cable.composite.bodies[0].position.y);
            }

            for (let i = 1; i < cable.composite.bodies.length; i++) {
                cable.display.lineTo(cable.composite.bodies[i].position.x, cable.composite.bodies[i].position.y);
            }

            // if it's connected at the back, end with what it's connected to
            if (cable.connectionBack !== null) {
                cable.display.lineTo(cable.connectionBack.body.position.x, cable.connectionBack.body.position.y);
            }

        });

        // points
        app.stage.removeChild(pointsText);
        pointsText = new Text(`${player.points}`, style);
        pointsText.x = 50;
        pointsText.y = 50;
        app.stage.addChild(pointsText);

        machines.forEach(m => {
            app.stage.removeChild(m.loadsText);
            m.loadsText = new Text(`${m.loadsWaiting}`, style);
            m.loadsText.x = m.body.position.x - 50;
            m.loadsText.y = m.body.position.y - MACHINES.HEIGHT / 2;
            app.stage.addChild(m.loadsText);

            m.display.position.set(m.body.position.x, m.body.position.y);

            m.progressBar.clear();
            m.progressBar.beginFill(0xDE3249);
            m.progressBar.drawRect(m.body.position.x - 50, m.body.position.y + 100, m.loadProgress, 20);
            m.progressBar.endFill();
        })

        tick(delta * d);
    });
}