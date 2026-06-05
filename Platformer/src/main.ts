import kaplay from "kaplay";
import "kaplay/global";
import cicaMiniUrl from "../images/cicaMini.png";
import doggyUrl from "../images/doggy.png";
import flowers2kUrl from "../images/flowers2k.jpg";
import kukac2kUrl from "../images/kukac2k.jpg";
import { createBackground } from "./background";
import { loadCoinSounds, loadCoinSprites, setupCoins } from "./coins";
import { setupLevel2 } from "./level2";
import { createPlatforms } from "./platforms";
import { loadStickerChartAssets, setupCollectionUI } from "./stickerChart";
import { createWalls } from "./walls";
import { createPlayer, setupCicaPlayerSpawn, setupPlayerControls } from "./player";

const k = kaplay({
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: false,
    background: [255, 255, 255],
});

k.setGravity(1600);

k.loadSprite("cicaMini", cicaMiniUrl);
k.loadSprite("doggy", doggyUrl);
k.loadSprite("flowers2k", flowers2kUrl);
k.loadSprite("kukac2k", kukac2kUrl);
loadCoinSprites(k);
loadCoinSounds(k);
loadStickerChartAssets(k);

k.scene("level1", () => {
    createBackground(k);
    createPlatforms(k);
    createWalls(k);

    const player = createPlayer(k);
    setupPlayerControls(k, player);
    setupCicaPlayerSpawn(k);

    const collectionUI = setupCollectionUI(k);
    setupCoins(k, { onCollect: collectionUI.onCoinCollected });
});

k.scene("level2", () => {
    setupLevel2(k);
});

k.onLoad(() => {
    k.go("level1");
});
