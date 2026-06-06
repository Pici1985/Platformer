import kaplay from "kaplay";
import "kaplay/global";
import playerTwoUrl from "../images/players/cicaMini.png";
import doggyUrl from "../images/players/doggy.png";
import flowers2kUrl from "../images/backgrounds/flowers2k.jpg";
import kukac2kUrl from "../images/backgrounds/kukac2k.jpg";
import storm2kUrl from "../images/backgrounds/storm2k.png";
import { createBackground } from "./background";
import { loadCakeSprites, loadCoinSounds, loadCoinSprites, setupCoins } from "./coins";
import { setupLevel2 } from "./level2";
import { setupLevel3 } from "./level3";
import { createPlatforms } from "./platforms";
import { loadStickerChartAssets, setupCollectionUI } from "./stickerChart";
import { createWalls } from "./walls";
import { createPlayer, loadPlayerSounds, PLAYER_TWO_SPRITE, setupPlayerControls, setupPlayerTwoSpawn } from "./player";

const k = kaplay({
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: false,
    background: [255, 255, 255],
});

k.setGravity(1600);

k.loadSprite(PLAYER_TWO_SPRITE, playerTwoUrl);
k.loadSprite("doggy", doggyUrl);
k.loadSprite("flowers2k", flowers2kUrl);
k.loadSprite("kukac2k", kukac2kUrl);
k.loadSprite("storm2k", storm2kUrl);
loadCoinSprites(k);
loadCakeSprites(k);
loadCoinSounds(k);
loadPlayerSounds(k);
loadStickerChartAssets(k);

k.scene("level1", () => {
    createBackground(k);
    createPlatforms(k);
    createWalls(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupPlayerTwoSpawn(k);

    const collectionUI = setupCollectionUI(k);
    setupCoins(k, { onCollect: collectionUI.onCoinCollected });
});

k.scene("level2", () => {
    setupLevel2(k);
});

k.scene("level3", () => {
    setupLevel3(k);
});

k.onLoad(() => {
    k.go("level1");
});
