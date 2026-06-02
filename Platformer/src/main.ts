import kaplay from "kaplay";
import "kaplay/global";
import doggyUrl from "../images/doggy.png";
import flowers2kUrl from "../images/flowers2k.jpg";
import { createBackground } from "./background";
import { loadCoinSounds, loadCoinSprites, setupCoins } from "./coins";
import { scaleX, scaleY } from "./layout";
import { setupNextLevelScene } from "./nextLevel";
import { createPlatforms } from "./platforms";
import { loadStickerChartAssets, setupCollectionUI } from "./stickerChart";
import { createWalls } from "./walls";

const k = kaplay({
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: false,
    background: [255, 255, 255],
});

k.setGravity(1600);

k.loadSprite("doggy", doggyUrl);
k.loadSprite("flowers2k", flowers2kUrl);
loadCoinSprites(k);
loadCoinSounds(k);
loadStickerChartAssets(k);

k.scene("level1", () => {
    createBackground(k);
    createPlatforms(k);
    createWalls(k);

    const player = k.add([
        k.sprite("doggy"),
        k.pos(scaleX(k, 100), scaleY(k, 200)),
        k.area(),
        k.body(),
        "player",
    ]);

    const SPEED = 300;
    const JUMP_FORCE = 800;

    k.onKeyDown("left", () => {
        player.move(-SPEED, 0);
        player.flipX = false;
    });

    k.onKeyDown("right", () => {
        player.move(SPEED, 0);
        player.flipX = true;
    });

    k.onKeyPress("up", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
        }
    });

    const collectionUI = setupCollectionUI(k);
    setupCoins(k, { onCollect: collectionUI.onCoinCollected });
});

k.scene("nextLevel", () => {
    setupNextLevelScene(k);
});

k.onLoad(() => {
    k.go("level1");
});
