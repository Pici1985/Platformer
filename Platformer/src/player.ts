import type { GameObj, KAPLAYCtx, KEventController } from "kaplay";
import giggleSoundUrl from "../sounds/giggle.mp3";
import { DESIGN_WIDTH, scaleX, scaleY } from "./layout";

/** Doggy sprite size in design pixels (see images/players/doggy.png). */
const DOGGY_WIDTH = 150;
const DOGGY_HEIGHT = 100;

/** Player two sprite size in design pixels. */
const PLAYER_TWO_SPRITE_WIDTH = 43;
const PLAYER_TWO_HITBOX_WIDTH = 40;

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

const PLAYER_TWO_HITBOX: Hitbox = {
    offsetX: (PLAYER_TWO_SPRITE_WIDTH - PLAYER_TWO_HITBOX_WIDTH) / 2,
    offsetY: HITBOX_INSET_TOP,
    width: PLAYER_TWO_HITBOX_WIDTH,
    height: HITBOX_HEIGHT,
};

const SPEED = 300;
const JUMP_FORCE = 800;

const SPEED_PLAYER_TWO = 320;
const JUMP_FORCE_PLAYER_TWO = 900;

export const PLAYER_TWO_SPRITE = "playerTwo";

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

export function loadPlayerSounds(k: KAPLAYCtx) {
    k.loadSound("playerTwoSpawnGiggle", giggleSoundUrl);
}

export function createPlayer(
    k: KAPLAYCtx,
    spawnX = 100,
    spawnY = 200,
) {
    return createCharacter(k, "doggy", spawnX, spawnY, DOGGY_HITBOX);
}

export function createPlayerTwo(
    k: KAPLAYCtx,
    spawnX = DESIGN_WIDTH - 100,
    spawnY = 200,
) {
    return createCharacter(k, PLAYER_TWO_SPRITE, spawnX, spawnY, PLAYER_TWO_HITBOX);
}

function setupCharacterControls(
    k: KAPLAYCtx,
    player: GameObj,
    left: string,
    right: string,
    jump: string,
    speed: number,
    jumpForce: number,
) {
    return [
        k.onKeyDown(left, () => {
            player.move(-speed, 0);
            player.flipX = false;
        }),
        k.onKeyDown(right, () => {
            player.move(speed, 0);
            player.flipX = true;
        }),
        k.onKeyPress(jump, () => {
            if (player.isGrounded()) {
                player.jump(jumpForce);
            }
        }),
    ];
}

export function setupPlayerControls(k: KAPLAYCtx, player: GameObj) {
    return setupCharacterControls(k, player, "left", "right", "up", SPEED, JUMP_FORCE);
}

function setupPlayerTwoControls(k: KAPLAYCtx, player: GameObj) {
    return setupCharacterControls(k, player, "a", "d", "w", SPEED_PLAYER_TWO, JUMP_FORCE_PLAYER_TWO);
}

/** Whether player two is active in the game (persists across levels). */
let playerTwoActive = false;

/** Spawn player two on numpad +; remove with numpad -; persists to later levels until removed. */
export function setupPlayerTwoSpawn(k: KAPLAYCtx) {
    let playerTwo: GameObj | null = null;
    let controls: KEventController[] = [];

    const spawnPlayerTwo = (playSound: boolean) => {
        if (playerTwo) return;

        playerTwo = createPlayerTwo(k);
        if (playSound) k.play("playerTwoSpawnGiggle");
        controls = setupPlayerTwoControls(k, playerTwo);

        playerTwo.onDestroy(() => {
            controls.forEach((c) => c.cancel());
            controls = [];
            playerTwo = null;
        });
    };

    k.onKeyPress("+", () => {
        if (playerTwo) return;
        playerTwoActive = true;
        spawnPlayerTwo(true);
    });

    k.onKeyPress("-", () => {
        if (!playerTwo) return;
        playerTwoActive = false;
        k.destroy(playerTwo);
    });

    if (playerTwoActive) {
        spawnPlayerTwo(false);
    }
}
