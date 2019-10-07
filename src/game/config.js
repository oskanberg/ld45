
export const WORLD = {
    WIDTH: 1600,
    HEIGHT: 900,
    TICKS_PS: 60.0
};

export const PLAYER = {
    SPEED: 1e-1 / WORLD.TICKS_PS,
    RADIUS: 25,
    GRAB_DISTANCE: 120
};

export const MACHINES = {
    HEIGHT: 150,
    WIDTH: 100,
    PROGRESS_PER_TICK: 20 * (1 / WORLD.TICKS_PS)
};

export const PLUGS = {
    HEIGHT: 40,
    WIDTH: 60,
};