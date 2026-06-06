import type { KAPLAYCtx } from "kaplay";
import { createBackground, STORM2K_SPRITE } from "./background";
import { CAKE_SPRITE_NAMES, CAKE_SPRITES, setupCoins } from "./coins";
import { createLevel3Platforms } from "./level3Platforms";
import { createPlayer, setupPlayerControls, setupPlayerTwoSpawn } from "./player";
import { setupCollectionUI } from "./stickerChart";
import { createWalls } from "./walls";

export function setupLevel3(k: KAPLAYCtx) {
    createBackground(k, STORM2K_SPRITE);
    createWalls(k);
    createLevel3Platforms(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupPlayerTwoSpawn(k);

    const collectionUI = setupCollectionUI(k, {
        nextLevelScene: "level1",
        chartSprites: CAKE_SPRITE_NAMES,
    });
    setupCoins(k, { onCollect: collectionUI.onCoinCollected, sprites: CAKE_SPRITES });
}
