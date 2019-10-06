
export const WORLD = {
    WIDTH: 1600,
    HEIGHT: 900,
    TICKS_PS: 60.0
};

export const PLAYER = {
    SPEED: 1e-3,
    HEIGHT: 100,
    WIDTH: 80,
    GRAB_DISTANCE: 150
};

export const MACHINES = {
    HEIGHT: 100,
    WIDTH: 80,
    PROGRESS_PER_TICK: 20 * (1 / WORLD.TICKS_PS)
};

export const PLUGS = {
    HEIGHT: 40,
    WIDTH: 60,
};