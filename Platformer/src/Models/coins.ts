import type { GameObj, KAPLAYCtx } from "kaplay";
import blueCoinUrl from "../../images/coins/blueCoin.png";
import cake1Url from "../../images/coins/cake1.png";
import cake2Url from "../../images/coins/cake2.png";
import cake3Url from "../../images/coins/cake3.png";
import cake4Url from "../../images/coins/cake4.png";
import cake5Url from "../../images/coins/cake5.png";
import cake6Url from "../../images/coins/cake6.png";
import cake7Url from "../../images/coins/cake7.png";
import cake8Url from "../../images/coins/cake8.png";
import goldCoinUrl from "../../images/coins/goldCoin.png";
import greenCoinUrl from "../../images/coins/greenCoin.png";
import redCoinUrl from "../../images/coins/redCoin.png";
import collectSoundUrl from "../../sounds/popup.mp3";
import spawnSoundUrl from "../../sounds/spawn.wav";
import { scaleUniform } from "../Base/layout";

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

export const CAKE_SPRITES = [
    { name: "cake1", url: cake1Url },
    { name: "cake2", url: cake2Url },
    { name: "cake3", url: cake3Url },
    { name: "cake4", url: cake4Url },
    { name: "cake5", url: cake5Url },
    { name: "cake6", url: cake6Url },
    { name: "cake7", url: cake7Url },
    { name: "cake8", url: cake8Url },
] as const;

export const CAKE_SPRITE_NAMES = CAKE_SPRITES.map((cake) => cake.name);

type CoinSprite = (typeof COIN_SPRITES)[number] | (typeof CAKE_SPRITES)[number];
type CoinObj = GameObj & { spinPhase?: number };

export function loadCoinSprites(k: KAPLAYCtx) {
    for (const coin of COIN_SPRITES) {
        k.loadSprite(coin.name, coin.url);
    }
}

export function loadCakeSprites(k: KAPLAYCtx) {
    for (const cake of CAKE_SPRITES) {
        k.loadSprite(cake.name, cake.url);
    }
}

export function loadCoinSounds(k: KAPLAYCtx) {
    k.loadSound("coinSpawn", spawnSoundUrl);
    k.loadSound("coinCollect", collectSoundUrl);
}

function randomCoinSprite(k: KAPLAYCtx, sprites: readonly CoinSprite[]) {
    const index = Math.floor(k.rand(0, sprites.length));
    return sprites[index].name;
}

function spawnCoin(k: KAPLAYCtx, sprites: readonly CoinSprite[]) {
    const size = scaleUniform(k, COIN_SIZE);
    const width = size;
    const height = size;
    const x = k.rand(width / 2, k.width() - width / 2);
    const y = k.rand(height / 2, k.height() - height / 2);
    const sprite = randomCoinSprite(k, sprites);

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

export function setupCoins(
    k: KAPLAYCtx,
    opts?: { onCollect?: () => void; sprites?: readonly CoinSprite[] },
) {
    const sprites = opts?.sprites ?? COIN_SPRITES;

    k.onCollide("player", "coin", (_player, coin) => {
        k.play("coinCollect");
        k.destroy(coin);
        opts?.onCollect?.();
    });

    k.onUpdate("coin", (coin) => updateCoinSpin(k, coin as CoinObj));

    k.loop(SPAWN_INTERVAL, () => spawnCoin(k, sprites));
}
