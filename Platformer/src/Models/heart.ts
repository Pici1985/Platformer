import type { GameObj, KAPLAYCtx } from "kaplay";
import heartNoBgUrl from "../../images/coins/heartNoBg.png";
import collectSoundUrl from "../../sounds/popup.mp3";
import spawnSoundUrl from "../../sounds/spawn.wav";
import { getActiveLifeDisplay } from "../Base/lifeDisplay";
import { HEART_SPAWN_INTERVAL_SEC } from "../config";
import { scaleUniform } from "../Base/layout";

export const HEART_SPRITE = "heartNoBg";

/** World heart pickup size in design pixels (coins use 50). */
export const HEART_SIZE = 72;

/** Heart icon size in the HUD life counter (design pixels). */
export const HUD_HEART_SIZE = 48;

/** Radians per second — one full spin takes ~0.63s at 10. */
const SPIN_SPEED = 10;

type HeartObj = GameObj & { spinPhase?: number };

let playerHeartCollideController: ReturnType<KAPLAYCtx["onCollide"]> | null = null;
let enemyHeartCollideController: ReturnType<KAPLAYCtx["onCollide"]> | null = null;
let heartSpinController: ReturnType<KAPLAYCtx["onUpdate"]> | null = null;
let heartSpawnLoop: ReturnType<KAPLAYCtx["loop"]> | null = null;

export function loadHeartSprites(k: KAPLAYCtx) {
    k.loadSprite(HEART_SPRITE, heartNoBgUrl);
}

export function loadHeartSounds(k: KAPLAYCtx) {
    k.loadSound("heartSpawn", spawnSoundUrl);
    k.loadSound("heartCollect", collectSoundUrl);
}

function spawnHeart(k: KAPLAYCtx) {
    const size = scaleUniform(k, HEART_SIZE);
    const x = k.rand(size / 2, k.width() - size / 2);
    const y = k.rand(size / 2, k.height() - size / 2);

    const heart = k.add([
        k.sprite(HEART_SPRITE, { width: size, height: size }),
        k.pos(x, y),
        k.anchor("center"),
        k.scale(1),
        k.area(),
        "heart",
    ]);

    (heart as HeartObj).spinPhase = k.rand(0, Math.PI * 2);
    k.play("heartSpawn");
}

function updateHeartSpin(k: KAPLAYCtx, heart: HeartObj) {
    heart.spinPhase = (heart.spinPhase ?? 0) + k.dt() * SPIN_SPEED;
    const facing = Math.cos(heart.spinPhase);
    heart.scale.x = Math.abs(facing);
    heart.flipX = facing < 0;
}

export function setupHearts(k: KAPLAYCtx) {
    playerHeartCollideController?.cancel();
    enemyHeartCollideController?.cancel();
    heartSpinController?.cancel();
    heartSpawnLoop?.cancel();

    playerHeartCollideController = k.onCollide("player", "heart", (_player, heart) => {
        if (!heart.exists()) return;

        k.play("heartCollect");
        k.destroy(heart);
        getActiveLifeDisplay()?.gainLife();
    });

    enemyHeartCollideController = k.onCollide("enemy", "heart", (_enemy, heart) => {
        if (!heart.exists()) return;
        k.destroy(heart);
    });

    heartSpinController = k.onUpdate("heart", (heart) =>
        updateHeartSpin(k, heart as HeartObj),
    );

    heartSpawnLoop = k.loop(
        HEART_SPAWN_INTERVAL_SEC,
        () => spawnHeart(k),
        Infinity,
        true,
    );
}
