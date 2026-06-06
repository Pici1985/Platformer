import type { KAPLAYCtx } from "kaplay";
import { createBackground, KUKAC2K_SPRITE } from "./background";
import { setupCoins } from "./coins";
import { createLevel2Platforms } from "./level2Platforms";
import { createPlayer, setupPlayerControls, setupPlayerTwoSpawn } from "./player";
import { setupCollectionUI } from "./stickerChart";
import { createWalls } from "./walls";

export function setupLevel2(k: KAPLAYCtx) {
    createBackground(k, KUKAC2K_SPRITE);
    createWalls(k);
    createLevel2Platforms(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupPlayerTwoSpawn(k);

    const collectionUI = setupCollectionUI(k, { nextLevelScene: "level3" });
    setupCoins(k, { onCollect: collectionUI.onCoinCollected });
}
