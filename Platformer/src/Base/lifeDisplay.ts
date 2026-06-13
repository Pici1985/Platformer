import type { GameObj, KAPLAYCtx } from "kaplay";
import heartNoBgUrl from "../../images/coins/heartNoBg.png";
import { scaleUniform, scaleX, scaleY } from "./layout";
import { getSelectedDifficulty } from "../Dialogs/difficultySelect";

export const HEART_SPRITE = "heartNoBg";

/** Number of lives shown in the HUD. */
export const MAX_LIVES = 3;

/** Heart icon size in design pixels. */
const HEART_SIZE = 48;
const HEART_GAP = 12;
const TOP_LEFT_MARGIN = 24;

type HeartObj = GameObj & { width: number; height: number };

export type LifeDisplay = {
    loseLife: () => boolean;
    getLives: () => number;
};

let remainingLives = MAX_LIVES;

export function resetLives() {
    remainingLives = MAX_LIVES;
}

export function loadLifeDisplayAssets(k: KAPLAYCtx) {
    k.loadSprite(HEART_SPRITE, heartNoBgUrl);
}

export function setupLifeDisplay(k: KAPLAYCtx): LifeDisplay | null {
    const difficulty = getSelectedDifficulty();
    if (difficulty === "easy") return null;

    let lives = remainingLives;

    const root = k.add([
        k.fixed(),
        k.z(100),
        k.anchor("topleft"),
        k.pos(0, 0),
    ]);

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
        const size = scaleUniform(k, HEART_SIZE);
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

    return {
        loseLife() {
            if (lives <= 0) return false;

            lives--;
            remainingLives = lives;
            k.destroy(hearts[lives]);
            return lives > 0;
        },
        getLives: () => lives,
    };
}
