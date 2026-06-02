import type { GameObj, KAPLAYCtx } from "kaplay";
import blueCoinUrl from "../images/blueCoin.png";
import goldCoinUrl from "../images/goldCoin.png";
import greenCoinUrl from "../images/greenCoin.png";
import redCoinUrl from "../images/redCoin.png";
import collectSoundUrl from "../sounds/collect.wav";
import spawnSoundUrl from "../sounds/spawn.wav";
import { scaleX, scaleY } from "./layout";

const COIN_SIZE = 50;

/** Display size for coins on the sticker chart modal. */
export const CHART_COIN_SIZE = 30;

export const BLUE_COIN_SPRITE = "blueCoin";
export const GOLD_COIN_SPRITE = "goldCoin";
export const GREEN_COIN_SPRITE = "greenCoin";
export const RED_COIN_SPRITE = "redCoin";
const SPAWN_INTERVAL = 5;
/** Radians per second — one full spin takes ~0.63s at 10. */
const SPIN_SPEED = 10;

const COIN_SPRITES = [
    { name: "blueCoin", url: blueCoinUrl },
    { name: "goldCoin", url: goldCoinUrl },
    { name: "greenCoin", url: greenCoinUrl },
    { name: "redCoin", url: redCoinUrl },
] as const;

type CoinObj = GameObj & { spinPhase?: number };

export function loadCoinSprites(k: KAPLAYCtx) {
    for (const coin of COIN_SPRITES) {
        k.loadSprite(coin.name, coin.url);
    }
}

export function loadCoinSounds(k: KAPLAYCtx) {
    k.loadSound("coinSpawn", spawnSoundUrl);
    k.loadSound("coinCollect", collectSoundUrl);
}

function randomCoinSprite(k: KAPLAYCtx) {
    const index = Math.floor(k.rand(0, COIN_SPRITES.length));
    return COIN_SPRITES[index].name;
}

function spawnCoin(k: KAPLAYCtx) {
    const width = scaleX(k, COIN_SIZE);
    const height = scaleY(k, COIN_SIZE);
    const x = k.rand(width / 2, k.width() - width / 2);
    const y = k.rand(height / 2, k.height() - height / 2);
    const sprite = randomCoinSprite(k);

    const coin = k.add([
        k.sprite(sprite, { width, height }),
        k.pos(x, y),
        k.anchor("center"),
        k.scale(1),
        k.area(),
        "coin",
    ]);

    (coin as CoinObj).spinPhase = k.rand(0, Math.PI * 2);
    k.play("coinSpawn");
}

function updateCoinSpin(k: KAPLAYCtx, coin: CoinObj) {
    coin.spinPhase = (coin.spinPhase ?? 0) + k.dt() * SPIN_SPEED;
    const facing = Math.cos(coin.spinPhase);
    coin.scale.x = Math.abs(facing);
    coin.flipX = facing < 0;
}

export function setupCoins(k: KAPLAYCtx, opts?: { onCollect?: () => void }) {
    k.onCollide("player", "coin", (_player, coin) => {
        k.play("coinCollect");
        k.destroy(coin);
        opts?.onCollect?.();
    });

    k.onUpdate("coin", (coin) => updateCoinSpin(k, coin as CoinObj));

    k.loop(SPAWN_INTERVAL, () => spawnCoin(k));
}
