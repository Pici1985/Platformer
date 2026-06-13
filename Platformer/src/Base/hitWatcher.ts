import type { Collision, KAPLAYCtx } from "kaplay";
import type { LifeDisplay } from "./lifeDisplay";
import { showGameOver } from "../Dialogs/gameOver";

/** Seconds before the player can lose another life to the same enemy. */
const HIT_COOLDOWN_SEC = 1.5;

function isSideCollision(col: Collision): boolean {
    return Math.abs(col.normal.x) > Math.abs(col.normal.y);
}

export function setupHitWatcher(k: KAPLAYCtx, lifeDisplay: LifeDisplay) {
    let hitCooldown = 0;
    let gameOverShown = false;

    const collideController = k.onCollide("player", "enemy", (_player, _enemy, col) => {
        if (gameOverShown || hitCooldown > 0 || !col || !isSideCollision(col)) return;

        const stillAlive = lifeDisplay.loseLife();
        hitCooldown = HIT_COOLDOWN_SEC;

        if (!stillAlive) {
            gameOverShown = true;
            showGameOver(k);
        }
    });

    const cooldownController = k.onUpdate(() => {
        if (hitCooldown > 0) {
            hitCooldown -= k.dt();
        }
    });

    return () => {
        collideController.cancel();
        cooldownController.cancel();
    };
}
