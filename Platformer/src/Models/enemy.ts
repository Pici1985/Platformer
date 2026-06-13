import type { GameObj, KAPLAYCtx } from "kaplay";
import wolfUrl from "../../images/players/wolf.png";
import {
    DESIGN_WIDTH,
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
    scalePhysics,
    scaleSize,
    scaleX,
    scaleY,
} from "../Base/layout";
import { getSelectedDifficulty } from "../Dialogs/difficultySelect";

export const WOLF_SPRITE = "wolf";

/** Wolf display size in design pixels. */
export const ENEMY_WIDTH = 90;
export const ENEMY_HEIGHT = 120;

/** Horizontal patrol speed in design pixels per second. */
const ENEMY_SPEED = 120;

/** Minimum seconds between random turn checks (may or may not turn). */
const MIN_RANDOM_TURN_SEC = 1;

/** Chance to reverse direction when a random turn check fires (0–1). */
const RANDOM_TURN_CHANCE = 0.5;

/** Default spawn on the middle platform (level 1). */
const WOLF_SPAWN_X = 840;
const WOLF_SPAWN_Y = 375 - ENEMY_HEIGHT;

export function loadEnemySprites(k: KAPLAYCtx) {
    k.loadSprite(WOLF_SPRITE, wolfUrl);
}

function syncFacing(enemy: GameObj, direction: number) {
    enemy.flipX = direction > 0;
}

function setupWolfPatrol(k: KAPLAYCtx, enemy: GameObj, enemyWidth: number) {
    let direction = k.rand(0, 1) < 0.5 ? -1 : 1;
    let secondsUntilRandomTurn = MIN_RANDOM_TURN_SEC + k.rand(0, 1);
    const speed = scalePhysics(k, ENEMY_SPEED);
    const minX = scaleX(k, LEFT_WALL_WIDTH);
    const maxX = scaleX(k, DESIGN_WIDTH - RIGHT_WALL_WIDTH) - enemyWidth;

    syncFacing(enemy, direction);

    const turn = () => {
        direction *= -1;
        syncFacing(enemy, direction);
    };

    const turnFromSideWall = (newDirection: number) => {
        direction = newDirection;
        syncFacing(enemy, direction);
        secondsUntilRandomTurn = MIN_RANDOM_TURN_SEC + k.rand(0, 1);
    };

    const updateController = k.onUpdate(() => {
        enemy.move(direction * speed, 0);

        if (enemy.pos.x <= minX) {
            enemy.pos.x = minX;
            if (direction < 0) turnFromSideWall(1);
        } else if (enemy.pos.x >= maxX) {
            enemy.pos.x = maxX;
            if (direction > 0) turnFromSideWall(-1);
        }

        secondsUntilRandomTurn -= k.dt();
        if (secondsUntilRandomTurn <= 0) {
            if (k.rand(0, 1) < RANDOM_TURN_CHANCE) {
                turn();
            }
            secondsUntilRandomTurn = MIN_RANDOM_TURN_SEC + k.rand(0, 1);
        }
    });

    enemy.onDestroy(() => {
        updateController.cancel();
    });
}

export function createWolfEnemy(
    k: KAPLAYCtx,
    spawnX = WOLF_SPAWN_X,
    spawnY = WOLF_SPAWN_Y,
) {
    const { width, height } = scaleSize(k, ENEMY_WIDTH, ENEMY_HEIGHT);

    const enemy = k.add([
        k.sprite(WOLF_SPRITE, { width, height }),
        k.pos(scaleX(k, spawnX), scaleY(k, spawnY)),
        k.area({ shape: new k.Rect(k.vec2(0, 0), width, height) }),
        k.body(),
        "enemy",
    ]);

    setupWolfPatrol(k, enemy, width);
    return enemy;
}

export function spawnEnemiesForDifficulty(k: KAPLAYCtx) {
    const difficulty = getSelectedDifficulty();
    if (difficulty === "easy") return;

    createWolfEnemy(k);
}
