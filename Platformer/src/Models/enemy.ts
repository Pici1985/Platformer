import type { Collision, GameObj, KAPLAYCtx } from "kaplay";
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
import type { LifeDisplay } from "../Base/lifeDisplay";
import { ENEMY_SPAWN_INTERVAL_SEC } from "../config";

export const WOLF_SPRITE = "wolf";

/** Wolf display size in design pixels. */
export const ENEMY_WIDTH = 90;
export const ENEMY_HEIGHT = 120;

/** Horizontal patrol speed in design pixels per second. */
const ENEMY_SPEED = 120;

/** Top fraction of the enemy hitbox used only for the worldArea fallback (0–1). */
const STOMP_ZONE_RATIO = 0.45;

/** Small upward hop on a side hit (design px/s; normal player jump is ~800). */
export const ENEMY_KICKBACK_JUMP_FORCE = 300;

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

/** Cooldown before the same pair can turn again while still overlapping. */
const ENEMY_PAIR_TURN_COOLDOWN_SEC = 0.2;

const patrolTurnByEnemy = new WeakMap<GameObj, () => void>();
const overlappingEnemyPairs = new Set<string>();
const enemyPairTurnCooldowns = new Map<string, number>();

function enemyPairKey(a: GameObj, b: GameObj) {
    return a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
}

function reverseEnemyPatrol(enemy: GameObj) {
    patrolTurnByEnemy.get(enemy)?.();
}

export function defeatEnemy(k: KAPLAYCtx, enemy: GameObj) {
    if (!enemy.exists() || !enemy.is("enemy")) return;

    enemy.untag("enemy");

    // Defer destroy until after the collision step finishes.
    k.wait(0, () => {
        if (enemy.exists()) {
            k.destroy(enemy);
        }
    });
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

    patrolTurnByEnemy.set(enemy, turn);

    const turnFromSideWall = (newDirection: number) => {
        direction = newDirection;
        syncFacing(enemy, direction);
        secondsUntilRandomTurn = MIN_RANDOM_TURN_SEC + k.rand(0, 1);
    };

    const updateController = k.onUpdate(() => {
        if (!enemy.exists() || !enemy.is("enemy")) return;

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
        patrolTurnByEnemy.delete(enemy);

        for (const key of [...overlappingEnemyPairs]) {
            if (key.includes(`${enemy.id}:`) || key.endsWith(`:${enemy.id}`)) {
                overlappingEnemyPairs.delete(key);
                enemyPairTurnCooldowns.delete(key);
            }
        }
    });
}

let enemyEnemyCollideController: ReturnType<KAPLAYCtx["onUpdate"]> | null = null;
let playerEnemyCollideController: ReturnType<KAPLAYCtx["onCollideUpdate"]> | null = null;
let playerEnemyCollideEndController: ReturnType<KAPLAYCtx["onCollideEnd"]> | null = null;

const handledPlayerEnemyPairs = new Set<string>();

function playerEnemyPairKey(player: GameObj, enemy: GameObj) {
    return `${player.id}:${enemy.id}`;
}

function areaBounds(obj: GameObj) {
    const pts = obj.worldArea().pts;
    let top = Infinity;
    let bottom = -Infinity;
    let left = Infinity;
    let right = -Infinity;

    for (const pt of pts) {
        top = Math.min(top, pt.y);
        bottom = Math.max(bottom, pt.y);
        left = Math.min(left, pt.x);
        right = Math.max(right, pt.x);
    }

    return { top, bottom, left, right, centerY: (top + bottom) / 2 };
}

function isStompFromTop(player: GameObj, enemy: GameObj, col?: Collision) {
    if (col) {
        const fromPlayer =
            col.source.id === player.id ? col : col.reverse();
        if (fromPlayer.isBottom()) return true;
    }

    const playerBounds = areaBounds(player);
    const enemyBounds = areaBounds(enemy);
    const stompLine =
        enemyBounds.top +
        (enemyBounds.bottom - enemyBounds.top) * STOMP_ZONE_RATIO;

    return (
        player.vel.y > 0 &&
        playerBounds.bottom <= stompLine &&
        playerBounds.centerY < enemyBounds.centerY
    );
}

function kickPlayerFromEnemy(k: KAPLAYCtx, player: GameObj) {
    player.vel.x = 0;
    player.jump(scalePhysics(k, ENEMY_KICKBACK_JUMP_FORCE));
}

function setupPlayerEnemyCollisions(
    k: KAPLAYCtx,
    lifeDisplay: LifeDisplay | null,
) {
    playerEnemyCollideController?.cancel();
    playerEnemyCollideEndController?.cancel();
    handledPlayerEnemyPairs.clear();

    playerEnemyCollideController = k.onCollideUpdate("player", "enemy", (player, enemy, col) => {
        const key = playerEnemyPairKey(player, enemy);
        if (handledPlayerEnemyPairs.has(key)) return;
        handledPlayerEnemyPairs.add(key);

        if (isStompFromTop(player, enemy, col)) {
            defeatEnemy(k, enemy);
            return;
        }

        kickPlayerFromEnemy(k, player);
        lifeDisplay?.loseLife();
    });

    playerEnemyCollideEndController = k.onCollideEnd("player", "enemy", (player, enemy) => {
        handledPlayerEnemyPairs.delete(playerEnemyPairKey(player, enemy));
    });
}

function setupEnemyEnemyCollisions(k: KAPLAYCtx) {
    enemyEnemyCollideController?.cancel();
    overlappingEnemyPairs.clear();
    enemyPairTurnCooldowns.clear();

    enemyEnemyCollideController = k.onUpdate(() => {
        const enemies = k.get("enemy");

        for (let i = 0; i < enemies.length; i++) {
            for (let j = i + 1; j < enemies.length; j++) {
                const a = enemies[i];
                const b = enemies[j];
                const key = enemyPairKey(a, b);
                const colliding = a.isColliding(b);

                if (!colliding) {
                    overlappingEnemyPairs.delete(key);
                    continue;
                }

                if (overlappingEnemyPairs.has(key)) continue;

                const cooldown = enemyPairTurnCooldowns.get(key) ?? 0;
                if (cooldown > 0) continue;

                overlappingEnemyPairs.add(key);
                reverseEnemyPatrol(a);
                reverseEnemyPatrol(b);
                enemyPairTurnCooldowns.set(key, ENEMY_PAIR_TURN_COOLDOWN_SEC);
            }
        }

        for (const [key, remaining] of [...enemyPairTurnCooldowns.entries()]) {
            const next = remaining - k.dt();
            if (next <= 0) enemyPairTurnCooldowns.delete(key);
            else enemyPairTurnCooldowns.set(key, next);
        }
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

export function setupEnemySpawner(
    k: KAPLAYCtx,
    lifeDisplay: LifeDisplay | null = null,
) {
    const difficulty = getSelectedDifficulty();
    if (difficulty === "easy") return;

    setupEnemyEnemyCollisions(k);
    setupPlayerEnemyCollisions(k, lifeDisplay);

    k.loop(ENEMY_SPAWN_INTERVAL_SEC, () => createWolfEnemy(k));
}
