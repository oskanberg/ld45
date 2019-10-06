
import { WORLD, MACHINES, PLUGS } from './config';
import { Application, Sprite, Text, TextStyle, Graphics } from 'pixi.js';
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



        const progressB = new Graphics()
        progressB.beginFill(0xDE3249);
        progressB.drawRect(machine.body.position.x - 50, machine.body.position.y + 100, machine.loadProgress, 20);
        progressB.endFill();

        machine.display = Sprite.from(earthPNG);
        machine.display.anchor.set(0.5);
        machine.display.width = MACHINES.WIDTH;
        machine.display.height = MACHINES.HEIGHT;
        machine.display.position.set(machine.body.position.x, machine.body.position.y);
        machine.progressBar = progressB;
        app.stage.addChild(machine.display);
        app.stage.addChild(machine.progressBar);

        // set uop progress rectangle in similar position
        // x y h w

    });

    // machines
    plugs.forEach(plug => {
        plug.display = Sprite.from(earthPNG);
        plug.display.anchor.set(0.5);
        plug.display.width = PLUGS.WIDTH;
        plug.display.height = PLUGS.HEIGHT;
        plug.display.position.set(plug.position.x, plug.position.y);
        app.stage.addChild(plug.display);
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

    let pointsText = new Text(`${player.points}`, style);
    pointsText.x = 50;
    pointsText.y = 50;
    app.stage.addChild(pointsText);

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

        // points
        app.stage.removeChild(pointsText);
        pointsText = new Text(`${player.points}`, style);
        pointsText.x = 50;
        pointsText.y = 50;
        app.stage.addChild(pointsText);

        machines.forEach(m => {
            // app.stage.removeChild(m.progressBar)
            m.progressBar.clear();
            m.progressBar.beginFill(0xDE3249);
            m.progressBar.drawRect(m.body.position.x - 50, m.body.position.y + 100, m.loadProgress, 20);
            m.progressBar.endFill();
            // app.stage.addChild(m.progressBar)
        })

        tick(delta * d);

        // Progress bar


    });
}