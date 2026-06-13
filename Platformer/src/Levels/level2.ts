import type { KAPLAYCtx } from "kaplay";
import { createBackground, KUKAC2K_SPRITE } from "../Base/background";
import { setupTouchControls } from "../Base/touchControls";
import { createWalls } from "../Base/walls";
import { setupCollectionUI } from "../Dialogs/stickerChart";
import { createLevel2Platforms } from "./level2Platforms";
import { createPlayer, setupPlayerControls, setupPlayerTwoSpawn } from "../Models/player";
import { setupCoins } from "../Models/coins";

export function setupLevel2(k: KAPLAYCtx) {
    createBackground(k, KUKAC2K_SPRITE);
    createWalls(k);
    createLevel2Platforms(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupTouchControls(k, player);
    setupPlayerTwoSpawn(k);

    const collectionUI = setupCollectionUI(k, { nextLevelScene: "level3" });
    setupCoins(k, { onCollect: collectionUI.onCoinCollected });
}
