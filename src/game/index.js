
import { WORLD, PLAYER, MACHINES } from './config';
import { Engine, Render, Body, Bodies, World, Composites, Vector, Constraint } from 'matter-js';

// framework objects
let engine;
let world;
let runner;

// in-game objects
let player;
let cables = [];
let machines = [];
let grabConstraint = null;

let playerDirection = {
    x: 0, y: 0,
};

const delta = 1000 / WORLD.TICKS_PS;
const startRunner = t => {
    runner = setInterval(() => t(delta), delta);
};

const tick = d => {
    let force = Vector.mult(playerDirection, PLAYER.SPEED);
    Body.applyForce(
        player,
        {
            x: player.position.x,
            y: player.position.y
        },
        force
    );
    Engine.update(engine, d);
};

const registerControls = handle => {
    let down = {};
    document.addEventListener(
        'keyup', e => { delete down[e.key]; handle(down); }
    );
    document.addEventListener(
        'keydown', e => { down[e.key] = true; handle(down); }
    );
};

const toggleGrab = () => {

    if (grabConstraint !== null) {
        World.remove(engine.world, grabConstraint);
        grabConstraint = null;
        return;
    }

    let playerPosition = player.position;
    let cablePosition = cables[0].bodies[0].position;

    let difference = Vector.sub(playerPosition, cablePosition);
    let distance = Vector.magnitude(difference);
    console.log(distance);

    if (distance <= 60) {

        grabConstraint = Constraint.create({
            bodyA: player,
            bodyB: cables[0].bodies[0],
            length: 25,
        });
        World.add(engine.world, grabConstraint);
    }
}

const onControlUpdate = downKeys => {
    // movement
    {
        let d = { x: 0, y: 0 };

        if ('w' in downKeys && !('s' in downKeys)) d.y = -1;
        if ('s' in downKeys && !('w' in downKeys)) d.y = 1;
        if ('a' in downKeys && !('d' in downKeys)) d.x = -1;
        if ('d' in downKeys && !('a' in downKeys)) d.x = 1;

        playerDirection = d;

        // space bar for plug / unplug

        if (' ' in downKeys) {
            toggleGrab();
        }
    }

    // pause unpause
    {
        if ('Escape' in downKeys) togglePause();
    }
};

const addPlayer = () => {
    player = Bodies.circle(
        WORLD.WIDTH / 2, 100, 20, {
        frictionAir: 0.05,
        density: 0.001,
        isStatic: false
    });
    World.add(engine.world, player);
};

const addCable = () => {
    let c = Composites.stack(350, 100, 100, 1, 1, 5, (x, y) => {
        return Bodies.circle(x, y, 5, {
            density: 0.0002,
            frictionAir: 0.05
        });
    });

    Composites.chain(c, 0.5, 0, -0.5, 0, {
        stiffness: 1,
        render: { type: 'line' }
    });

    cables.push(c);
    World.add(world, c);
};

const addMachine = (x, y) => {
    let w = (Bodies.rectangle(x, y, MACHINES.WIDTH, MACHINES.HEIGHT, {
        density: 0.1,
        frictionAir: 0.05
    }));

    machines.push(w);
    World.add(engine.world, w);

}

const togglePause = () => {
    if (!runner) return startRunner(tick);

    clearInterval(runner);
    runner = null;
};

const create = (element) => {
    engine = Engine.create();
    engine.constraintIterations = 10;
    world = engine.world;
    world.gravity.y = 0;
    world.gravity.x = 0;

    let render = Render.create({
        element: element,
        engine: engine,
        options: {
            width: WORLD.WIDTH,
            height: WORLD.HEIGHT,
            showAngleIndicator: true,
            showCollisions: true,
            showVelocity: true,
            wireframes: false,
        }
    });

    addPlayer();
    addCable();
    addMachine(WORLD.WIDTH / 2, WORLD.HEIGHT / 2);
    togglePause();
    Render.run(render);

    registerControls(onControlUpdate);

    return {
        canvas: render.canvas,
        pause: () => { clearInterval(runner) }
    };
};

export default create;