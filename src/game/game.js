
import { WORLD, PLAYER, MACHINES, PLUGS } from './config';
import { Engine, Render, Body, Bodies, World, Composites, Vector, Constraint } from 'matter-js';

// framework objects
let engine;
let world;
let runner;

// in-game objects
let player;
let cables = [];
let machines = [];
let plugs = [];

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

    machines
        .filter(m => m.isActivated && m.loadsWaiting > 0)
        .forEach(machine => {
            machine.body.position.x += Math.sin(machine.loadProgress * 2) + (Math.random() * 2) - 1;
            machine.loadProgress += MACHINES.PROGRESS_PER_TICK;

            if (machine.loadProgress >= 100) {
                player.points++;
                machine.loadProgress = 0;
                machine.loadsWaiting--;
                console.log("Points: " + player.points);
            }
        })

    Engine.update(engine, d);
};

const registerControls = (handleDown, handleUp) => {
    let down = {};
    document.addEventListener(
        'keyup', e => { delete down[e.key]; handleDown(down); handleUp(e.key); }
    );
    document.addEventListener(
        'keydown', e => { down[e.key] = true; handleDown(down); }
    );
};

const dropCable = () => {
    let connectedCables = cables.filter(
        c => {
            if (c.connectionFront !== null && c.connectionFront.body === player) return true;
            if (c.connectionBack !== null && c.connectionBack.body === player) return true;
            return false;
        }
    );


    for (let i = 0; i < connectedCables.length; i++) {
        let c = connectedCables[i];
        if (c.connectionFront !== null && c.connectionFront.body === player) {
            World.remove(engine.world, c.connectionFront.constraint);
            c.connectionFront = null;
            return {
                cable: c,
                body: c.composite.bodies[0],
                connection: 'connectionFront'
            }
        }

        if (c.connectionBack !== null && c.connectionBack.body === player) {
            World.remove(engine.world, c.connectionBack.constraint);
            c.connectionBack = null;
            return {
                cable: c,
                body: c.composite.bodies[c.composite.bodies.length - 1],
                connection: 'connectionBack'
            }
        }
    }
}



const isPlayerCarryingCable = () => {
    let connectedCables = cables.filter(
        c => {
            if (c.connectionFront !== null && c.connectionFront.body === player) return true;
            if (c.connectionBack !== null && c.connectionBack.body === player) return true;
            return false;
        }
    );

    if (connectedCables.length > 0) {
        return true;
    } else {
        return false;
    }
}

const nearestMachine = () => {

    let machineDistances = [];

    machines.forEach(m => {
        let difference = Vector.sub(player.position, m.body.position);
        let distance = Vector.magnitude(difference);
        machineDistances.push({
            distance: distance,
            machine: m.body
        });
    });

    machineDistances = machineDistances.filter(e => {
        return e.distance < PLAYER.GRAB_DISTANCE;
    });

    if (machineDistances.length === 0) {
        return {
            distance: null,
            machine: null
        }
    };

    machineDistances.sort((a, b) => a.distance > b.distance);
    return machineDistances[0];
};

const nearestPlug = () => {

    let plugDistances = [];

    plugs.forEach(plug => {
        let difference = Vector.sub(player.position, plug.position);
        let distance = Vector.magnitude(difference);
        plugDistances.push({
            distance: distance,
            plug: plug,
        });
    });

    plugDistances = plugDistances.filter(e => {
        return e.distance < PLAYER.GRAB_DISTANCE;
    });

    if (plugDistances.length === 0) {
        return {
            distance: null,
            plug: null
        }
    };

    plugDistances.sort((a, b) => a.distance > b.distance);
    return plugDistances[0];
}

const nearestCableEnd = () => {
    let nearestEnd = [];

    cables.forEach(c => {
        let difference = Vector.sub(player.position, c.composite.bodies[0].position);
        let distance = Vector.magnitude(difference);
        nearestEnd.push({
            distance: distance,
            cable: c,
            end: 'connectionFront',
            body: c.composite.bodies[0]
        });

        let differenceEnd = Vector.sub(player.position, c.composite.bodies[c.composite.bodies.length - 1].position);
        let distanceEnd = Vector.magnitude(differenceEnd);
        nearestEnd.push({
            distance: distanceEnd,
            cable: c,
            end: 'connectionBack',
            body: c.composite.bodies[c.composite.bodies.length - 1]
        });
    })


    nearestEnd = nearestEnd.filter(e => e.distance < PLAYER.GRAB_DISTANCE);
    nearestEnd.sort((a, b) => a.distance > b.distance);
    if (nearestEnd.length === 0) return {};

    return {
        cable: nearestEnd[0].cable,
        end: nearestEnd[0].end,
        body: nearestEnd[0].body
    }
}

const disconnectCableEnd = (cable, end) => {

    if (cable[end] === null) return;

    World.remove(engine.world, cable[end].constraint);
    cable[end] = null;
};

const connectToPlayer = (cable, end, body) => {

    let constraint = Constraint.create({
        bodyA: body,
        bodyB: player,
        length: 30,
        // stiffness: 0.8
    })

    cable[end] = {
        constraint,
        body: player
    };

    World.add(engine.world, constraint);
};

const updateMachineState = () => {
    let pluggedInCables = cables.filter(c => {
        if (c.connectionFront === null || c.connectionBack === null) {
            return false;
        }

        if (!plugs.some(p => (p === c.connectionFront.body || p === c.connectionBack.body))) {
            return false;
        }

        return true;
    });

    machines.forEach(machine => {
        machine.isActivated = false;
        console.log("setting machine inactive")
        pluggedInCables.forEach(cable => {
            if (cable.connectionFront.body === machine.body) {
                machine.isActivated = true;
                console.log("machine active")
            };

            if (cable.connectionBack.body === machine.body) {
                machine.isActivated = true;
                console.log("machine active")
            }
        })
    })

}

const toggleGrab = () => {

    if (isPlayerCarryingCable()) {

        let { cable, body, connection } = dropCable();

        let { machine, distance: machineDistance } = nearestMachine();

        let { plug, distance: plugDistance } = nearestPlug();


        // both
        if (plug === null && machine === null) {
            return;
        }

        if (machine === null || (plug !== null && plugDistance < machineDistance)) {
            let link = Constraint.create({
                bodyA: body,
                bodyB: plug,
                length: 10,
                pointB: { x: 0, y: (PLUGS.HEIGHT / 2) + 5 }
            })
            cable[connection] = {
                constraint: link,
                body: plug
            };
            World.add(engine.world, link);
            updateMachineState();
            return;
        }

        if (plug === null || (machine !== null && machineDistance < plugDistance)) {
            let link = Constraint.create({
                bodyA: body,
                bodyB: machine,
                length: 10,
                pointB: { x: -MACHINES.WIDTH / 2, y: 0 }
            })
            cable[connection] = {
                constraint: link,
                body: machine
            };
            World.add(engine.world, link);
            updateMachineState();
            return;
        }
        return;

    }

    // if the player was carrying nothing

    // find the nearest cable end < minimum distance

    // if it exists
    // if it was connected to anything
    // disconnect
    // connect it to the player


    let { cable, end, body } = nearestCableEnd();

    if (cable) {
        disconnectCableEnd(cable, end);
        updateMachineState();
        connectToPlayer(cable, end, body);
    }

}

const onKeyDownUpdate = downKeys => {
    // movement
    {
        let d = { x: 0, y: 0 };

        if ('w' in downKeys && !('s' in downKeys)) d.y = -1;
        if ('s' in downKeys && !('w' in downKeys)) d.y = 1;
        if ('a' in downKeys && !('d' in downKeys)) d.x = -1;
        if ('d' in downKeys && !('a' in downKeys)) d.x = 1;

        playerDirection = d;
    }

    // pause unpause
    {
        if ('Escape' in downKeys) togglePause();
    }
};

const onKeyUpUpdate = upKey => {
    // space bar for plug / unplug

    if (' ' === upKey) {
        toggleGrab();
    }
};

const addPlayer = () => {
    player = Bodies.circle(
        WORLD.WIDTH / 2, 100, 20, {
        frictionAir: 0.05,
        density: 0.001,
        isStatic: false
    });
    player.points = 0;
    World.add(engine.world, player);
};

const addCable = (xx, yy, length) => {
    let c = Composites.stack(xx, yy, 1, length, 1, 5, (x, y) => {
        return Bodies.circle(x, y, 5, {
            density: 0.0002,
            frictionAir: 0.03
        });
    });

    Composites.chain(c, 0.5, 0, -0.5, 0, {
        stiffness: 1,
        render: { type: 'line' }
    });

    cables.push({
        composite: c,
        connectionFront: null,
        connectionBack: null,
    });
    World.add(world, c);
};

const addMachine = (x, y) => {
    let w = (Bodies.rectangle(x, y, MACHINES.WIDTH, MACHINES.HEIGHT, {
        // density: 0.1,
        // frictionAir: 0.05,
        isStatic: true,
    }));

    machines.push({
        body: w,
        isActivated: false,
        loadProgress: 0,
        loadsWaiting: 3,
    });
    World.add(engine.world, w);

}

const addPlug = (x, y) => {
    let p = (Bodies.rectangle(x, y, PLUGS.WIDTH, PLUGS.HEIGHT, {
        // density: 0.1,
        // frictionAir: 0.05,
        isStatic: true,
    }));

    plugs.push(p);
    World.add(engine.world, p);
};

const togglePause = () => {
    if (!runner) return startRunner(tick);

    clearInterval(runner);
    runner = null;
};

const create = element => {
    engine = Engine.create();
    engine.constraintIterations = 1;
    world = engine.world;
    world.gravity.y = 0;
    world.gravity.x = 0;

    // let render = Render.create({
    //     element: element,
    //     engine: engine,
    //     options: {
    //         width: WORLD.WIDTH,
    //         height: WORLD.HEIGHT,
    //         showAngleIndicator: true,
    //         showCollisions: true,
    //         showVelocity: true,
    //         wireframes: false,
    //     }
    // });

    addPlayer();
    addCable(WORLD.WIDTH / 2.5, 100, 30);
    addCable(WORLD.WIDTH / 1.75, 100, 30);
    addMachine(WORLD.WIDTH * 2 / 3, WORLD.HEIGHT / 3);
    addMachine(WORLD.WIDTH / 2, WORLD.HEIGHT / 3);
    addMachine(WORLD.WIDTH / 3, WORLD.HEIGHT / 3);
    addMachine(WORLD.WIDTH * 2 / 3, WORLD.HEIGHT / 1.5);
    addMachine(WORLD.WIDTH / 2, WORLD.HEIGHT / 1.5);
    addMachine(WORLD.WIDTH / 3, WORLD.HEIGHT / 1.5);
    addPlug(WORLD.WIDTH / 2, PLUGS.HEIGHT / 2);
    // addPlug(WORLD.WIDTH / 1.5, PLUGS.HEIGHT / 2);
    // togglePause();
    // Render.run(render);

    registerControls(onKeyDownUpdate, onKeyUpUpdate);

    setInterval(() => {
        machines[Math.floor(Math.random() * machines.length)].loadsWaiting++;
    }, 5000)

    return {
        // canvas: render.canvas,
        // pause: () => { clearInterval(runner) },
        tick,
        player, cables, machines, plugs,
    };
};

export default create;