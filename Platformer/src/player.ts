import type { GameObj, KAPLAYCtx, KEventController } from "kaplay";
import { DESIGN_WIDTH, scaleX, scaleY } from "./layout";

/** Doggy sprite size in design pixels (see images/doggy.png). */
const DOGGY_WIDTH = 150;
const DOGGY_HEIGHT = 100;

/** Cica sprite size in design pixels (see images/cicaMini.png). */
const CICA_SPRITE_WIDTH = 43;
const CICA_HITBOX_WIDTH = 40;

/** Collision insets (design px); bottom edge stays flush with the sprite. */
const HITBOX_INSET_LEFT = 3;
const HITBOX_INSET_RIGHT = 3;
const HITBOX_INSET_TOP = 5;

const HITBOX_HEIGHT = DOGGY_HEIGHT - HITBOX_INSET_TOP;

type Hitbox = {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
};

const DOGGY_HITBOX: Hitbox = {
    offsetX: HITBOX_INSET_LEFT,
    offsetY: HITBOX_INSET_TOP,
    width: DOGGY_WIDTH - HITBOX_INSET_LEFT - HITBOX_INSET_RIGHT,
    height: HITBOX_HEIGHT,
};

const CICA_HITBOX: Hitbox = {
    offsetX: (CICA_SPRITE_WIDTH - CICA_HITBOX_WIDTH) / 2,
    offsetY: HITBOX_INSET_TOP,
    width: CICA_HITBOX_WIDTH,
    height: HITBOX_HEIGHT,
};

const SPEED = 300;
const JUMP_FORCE = 800;

function createCharacter(
    k: KAPLAYCtx,
    sprite: string,
    spawnX: number,
    spawnY: number,
    hitbox: Hitbox,
) {
    return k.add([
        k.sprite(sprite),
        k.pos(scaleX(k, spawnX), scaleY(k, spawnY)),
        k.area({
            shape: new k.Rect(
                k.vec2(hitbox.offsetX, hitbox.offsetY),
                hitbox.width,
                hitbox.height,
            ),
        }),
        k.body(),
        "player",
    ]);
}

export function createPlayer(
    k: KAPLAYCtx,
    spawnX = 100,
    spawnY = 200,
) {
    return createCharacter(k, "doggy", spawnX, spawnY, DOGGY_HITBOX);
}

export function createCicaPlayer(
    k: KAPLAYCtx,
    spawnX = DESIGN_WIDTH - 100,
    spawnY = 200,
) {
    return createCharacter(k, "cicaMini", spawnX, spawnY, CICA_HITBOX);
}

function setupCharacterControls(
    k: KAPLAYCtx,
    player: GameObj,
    left: string,
    right: string,
    jump: string,
) {
    return [
        k.onKeyDown(left, () => {
            player.move(-SPEED, 0);
            player.flipX = false;
        }),
        k.onKeyDown(right, () => {
            player.move(SPEED, 0);
            player.flipX = true;
        }),
        k.onKeyPress(jump, () => {
            if (player.isGrounded()) {
                player.jump(JUMP_FORCE);
            }
        }),
    ];
}

export function setupPlayerControls(k: KAPLAYCtx, player: GameObj) {
    return setupCharacterControls(k, player, "left", "right", "up");
}

function setupCicaPlayerControls(k: KAPLAYCtx, player: GameObj) {
    return setupCharacterControls(k, player, "a", "d", "w");
}

/** Spawn cica on numpad +; only one instance at a time. */
export function setupCicaPlayerSpawn(k: KAPLAYCtx) {
    let cicaPlayer: GameObj | null = null;
    let controls: KEventController[] = [];

    k.onKeyPress("+", () => {
        if (cicaPlayer) return;

        cicaPlayer = createCicaPlayer(k);
        controls = setupCicaPlayerControls(k, cicaPlayer);

        cicaPlayer.onDestroy(() => {
            controls.forEach((c) => c.cancel());
            controls = [];
            cicaPlayer = null;
        });
    });
}
