import type { GameObj, KAPLAYCtx } from "kaplay";
import { HEART_SPRITE, HUD_HEART_SIZE } from "../Models/heart";
import { scaleUniform, scaleX, scaleY } from "./layout";
import { getSelectedDifficulty } from "../Dialogs/difficultySelect";

/** Lives at the start of a new run (no upper cap when collecting hearts). */
export const STARTING_LIVES = 3;

const HEART_GAP = 12;
const TOP_LEFT_MARGIN = 24;

type HeartObj = GameObj & { width: number; height: number };

export type LifeDisplay = {
    loseLife: () => boolean;
    gainLife: () => void;
    getLives: () => number;
};

let remainingLives = STARTING_LIVES;
let hudRoot: GameObj | null = null;
let activeLifeDisplay: LifeDisplay | null = null;

export function resetLives() {
    remainingLives = STARTING_LIVES;
    activeLifeDisplay = null;
}

export function getActiveLifeDisplay() {
    return activeLifeDisplay;
}

export function setupLifeDisplay(k: KAPLAYCtx): LifeDisplay | null {
    const difficulty = getSelectedDifficulty();
    if (difficulty === "easy") {
        activeLifeDisplay = null;
        return null;
    }

    if (hudRoot?.exists()) {
        k.destroy(hudRoot);
    }

    let lives = remainingLives;

    const root = k.add([
        k.fixed(),
        k.z(100),
        k.anchor("topleft"),
        k.pos(0, 0),
    ]);
    hudRoot = root;

    const hearts: HeartObj[] = [];
    for (let i = 0; i < lives; i++) {
        hearts.push(
            root.add([
                k.sprite(HEART_SPRITE, { width: 1, height: 1 }),
                k.anchor("topleft"),
            ]) as HeartObj,
        );
    }

    const layout = () => {
        const size = scaleUniform(k, HUD_HEART_SIZE);
        const gap = scaleX(k, HEART_GAP);
        const margin = scaleUniform(k, TOP_LEFT_MARGIN);

        root.pos = k.vec2(margin, scaleY(k, TOP_LEFT_MARGIN));

        hearts.forEach((heart, i) => {
            heart.width = size;
            heart.height = size;
            heart.pos = k.vec2(i * (size + gap), 0);
        });
    };

    layout();
    k.onResize(layout);

    const lifeDisplay: LifeDisplay = {
        loseLife() {
            if (lives <= 0) return false;

            const heart = hearts.pop();
            if (heart?.exists()) {
                k.destroy(heart);
            }

            lives--;
            remainingLives = lives;
            layout();

            return lives > 0;
        },
        gainLife() {
            hearts.push(
                root.add([
                    k.sprite(HEART_SPRITE, { width: 1, height: 1 }),
                    k.anchor("topleft"),
                ]) as HeartObj,
            );
            lives++;
            remainingLives = lives;
            layout();
        },
        getLives: () => lives,
    };

    activeLifeDisplay = lifeDisplay;
    return lifeDisplay;
}
