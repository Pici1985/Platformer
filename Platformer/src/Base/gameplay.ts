import type { KAPLAYCtx } from "kaplay";
import { resetLives, setupLifeDisplay, type LifeDisplay } from "./lifeDisplay";
import { setupEnemySpawner } from "../Models/enemy";

/** Reset lives and set up hearts and enemies for a new run. */
export function beginNewGame(k: KAPLAYCtx): LifeDisplay | null {
    resetLives();
    return setupGameplay(k);
}

/** Set up hearts and enemies (lives carry over between levels). */
export function setupGameplay(k: KAPLAYCtx): LifeDisplay | null {
    const lifeDisplay = setupLifeDisplay(k);
    setupEnemySpawner(k, lifeDisplay);
    return lifeDisplay;
}
