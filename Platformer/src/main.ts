import kaplay from "kaplay";
import "kaplay/global";
import playerTwoUrl from "../images/players/cicaMini.png";
import csikosUrl from "../images/players/csikos.png";
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
import { loadCharacterSelectSounds, showCharacterSelect } from "./characterSelect";
import { DESIGN_GRAVITY, DESIGN_HEIGHT, DESIGN_WIDTH, scalePhysics } from "./layout";
import {
    createPlayer,
    CSIKOS_SPRITE,
    loadPlayerSounds,
    PLAYER_TWO_SPRITE,
    setupPlayerControls,
    setupPlayerTwoSpawn,
} from "./player";
import { loadTouchControlAssets, setupTouchControls } from "./touchControls";

const k = kaplay({
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    stretch: true,
    letterbox: true,
    background: [0, 0, 0],
});

k.setGravity(scalePhysics(k, DESIGN_GRAVITY));

k.loadSprite(PLAYER_TWO_SPRITE, playerTwoUrl);
k.loadSprite(CSIKOS_SPRITE, csikosUrl);
k.loadSprite("doggy", doggyUrl);
k.loadSprite("flowers2k", flowers2kUrl);
k.loadSprite("kukac2k", kukac2kUrl);
k.loadSprite("storm2k", storm2kUrl);
loadCoinSprites(k);
loadCakeSprites(k);
loadCoinSounds(k);
loadPlayerSounds(k);
loadCharacterSelectSounds(k);
loadStickerChartAssets(k);
loadTouchControlAssets(k);

k.scene("level1", () => {
    createBackground(k);
    createPlatforms(k);
    createWalls(k);

    showCharacterSelect(k, () => {
        const player = createPlayer(k);
        setupPlayerControls(k, player);
        setupTouchControls(k, player);
        setupPlayerTwoSpawn(k);

        const collectionUI = setupCollectionUI(k);
        setupCoins(k, { onCollect: collectionUI.onCoinCollected });
    });
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
