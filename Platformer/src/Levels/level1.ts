import type { KAPLAYCtx } from "kaplay";
import { createBackground } from "../Base/background";
import { createLevel1Platforms } from "./level1Platforms";
import { setupHitWatcher } from "../Base/hitWatcher";
import { setupLifeDisplay } from "../Base/lifeDisplay";
import { setupTouchControls } from "../Base/touchControls";
import { createWalls } from "../Base/walls";
import { showCharacterSelect } from "../Dialogs/characterSelect";
import { setupDifficultyIndicator, showDifficultySelect } from "../Dialogs/difficultySelect";
import { setupCollectionUI } from "../Dialogs/stickerChart";
import { setupCoins } from "../Models/coins";
import { spawnEnemiesForDifficulty } from "../Models/enemy";
import { createPlayer, setupPlayerControls, setupPlayerTwoSpawn } from "../Models/player";

export function setupLevel1(k: KAPLAYCtx) {
    createBackground(k);
    createLevel1Platforms(k);
    createWalls(k);

    showCharacterSelect(k, () => {
        // Defer one frame so the character-select click/key does not instantly confirm difficulty.
        k.wait(0, () => {
            showDifficultySelect(k, () => {
                setupDifficultyIndicator(k);
                const lifeDisplay = setupLifeDisplay(k);
                spawnEnemiesForDifficulty(k);

                const player = createPlayer(k);
                setupPlayerControls(k, player);
                setupTouchControls(k, player);
                setupPlayerTwoSpawn(k);

                if (lifeDisplay) {
                    setupHitWatcher(k, lifeDisplay);
                }

                const collectionUI = setupCollectionUI(k);
                setupCoins(k, { onCollect: collectionUI.onCoinCollected });
            });
        });
    });
}
