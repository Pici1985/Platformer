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
export const CSIKOS_SPRITE = "csikos";

/** Csikos sprite size in design pixels. */
const CSIKOS_WIDTH = 73;

export type PlayerCharacterId = "doggy" | "playerTwo" | "csikos";

type CharacterDef = {
    id: PlayerCharacterId;
    sprite: string;
    previewWidth: number;
    previewHeight: number;
    hitbox: Hitbox;
};

const CSIKOS_HITBOX: Hitbox = {
    offsetX: HITBOX_INSET_LEFT,
    offsetY: HITBOX_INSET_TOP,
    width: CSIKOS_WIDTH - HITBOX_INSET_LEFT - HITBOX_INSET_RIGHT,
    height: HITBOX_HEIGHT,
};

export const CHARACTER_OPTIONS: readonly CharacterDef[] = [
    { id: "doggy", sprite: "doggy", previewWidth: DOGGY_WIDTH, previewHeight: DOGGY_HEIGHT, hitbox: DOGGY_HITBOX },
    {
        id: "playerTwo",
        sprite: PLAYER_TWO_SPRITE,
        previewWidth: PLAYER_TWO_SPRITE_WIDTH,
        previewHeight: DOGGY_HEIGHT,
        hitbox: PLAYER_TWO_HITBOX,
    },
    {
        id: "csikos",
        sprite: CSIKOS_SPRITE,
        previewWidth: CSIKOS_WIDTH,
        previewHeight: DOGGY_HEIGHT,
        hitbox: CSIKOS_HITBOX,
    },
] as const;

const CHARACTER_BY_ID = Object.fromEntries(
    CHARACTER_OPTIONS.map((c) => [c.id, c]),
) as Record<PlayerCharacterId, CharacterDef>;

let selectedCharacterId: PlayerCharacterId = "doggy";

export function setSelectedCharacter(id: PlayerCharacterId) {
    selectedCharacterId = id;
}

export function getSelectedCharacter(): PlayerCharacterId {
    return selectedCharacterId;
}

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
    const character = CHARACTER_BY_ID[selectedCharacterId];
    return createCharacter(k, character.sprite, spawnX, spawnY, character.hitbox);
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
