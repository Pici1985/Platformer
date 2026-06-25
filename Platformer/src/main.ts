import kaplay from "kaplay";
import "kaplay/global";
import flowers2kUrl from "../images/backgrounds/flowers2k.jpg";
import kukac2kUrl from "../images/backgrounds/kukac2k.jpg";
import storm2kUrl from "../images/backgrounds/storm2k.png";
import playerTwoUrl from "../images/players/cicaMini.png";
import csikosUrl from "../images/players/csikos.png";
import doggyUrl from "../images/players/doggy.png";
import { DESIGN_GRAVITY, DESIGN_HEIGHT, DESIGN_WIDTH, scalePhysics } from "./Base/layout";
import { loadHeartSounds, loadHeartSprites } from "./Models/heart";
import { loadTouchControlAssets } from "./Base/touchControls";
import { loadCakeSprites, loadCoinSounds, loadCoinSprites } from "./Models/coins";
import { loadEnemySprites } from "./Models/enemy";
import { loadCharacterSelectSounds } from "./Dialogs/characterSelect";
import { loadStickerChartAssets } from "./Dialogs/stickerChart";
import { setupLevel1 } from "./Levels/level1";
import { setupLevel2 } from "./Levels/level2";
import { setupLevel3 } from "./Levels/level3";
import {
    CSIKOS_SPRITE,
    loadPlayerSounds,
    PLAYER_TWO_SPRITE,
} from "./Models/player";

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
loadEnemySprites(k);
loadCakeSprites(k);
loadCoinSounds(k);
loadPlayerSounds(k);
loadCharacterSelectSounds(k);
loadStickerChartAssets(k);
loadHeartSprites(k);
loadHeartSounds(k);
loadTouchControlAssets(k);

k.scene("level1", () => {
    setupLevel1(k);
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
