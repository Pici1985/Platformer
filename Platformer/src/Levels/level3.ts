import type { KAPLAYCtx } from "kaplay";
import { createBackground, STORM2K_SPRITE } from "../Base/background";
import { setupTouchControls } from "../Base/touchControls";
import { createWalls } from "../Base/walls";
import { setupCollectionUI } from "../Dialogs/stickerChart";
import { createPlayer, setupPlayerControls, setupPlayerTwoSpawn } from "../Models/player";
import { CAKE_SPRITE_NAMES, CAKE_SPRITES, setupCoins } from "../Models/coins";
import { createLevel3Platforms } from "./level3Platforms";

export function setupLevel3(k: KAPLAYCtx) {
    createBackground(k, STORM2K_SPRITE);
    createWalls(k);
    createLevel3Platforms(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupTouchControls(k, player);
    setupPlayerTwoSpawn(k);

    const collectionUI = setupCollectionUI(k, {
        nextLevelScene: "level1",
        chartSprites: CAKE_SPRITE_NAMES,
    });
    setupCoins(k, { onCollect: collectionUI.onCoinCollected, sprites: CAKE_SPRITES });
}
