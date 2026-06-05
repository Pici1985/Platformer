import type { KAPLAYCtx } from "kaplay";
import {
    DESIGN_WIDTH,
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
    scaleX,
    scaleY,
} from "./layout";

export const PLATFORM_WIDTH = 150;
export const PLATFORM_HEIGHT = 24;

export type PlatformDef = {
    width: number;
    height: number;
    xPosition: number;
    yPosition: number;
};

const PLATFORM_COLOR = [139, 90, 43] as const;

const SHADOW_OFFSET_X = 0;
const SHADOW_OFFSET_Y = 6;
const SHADOW_INSET_X = 3;
const SHADOW_OPACITY = 0.3;

export function addPlatform(
    k: KAPLAYCtx,
    width: number,
    height: number,
    xPosition: number,
    yPosition: number,
    color: readonly [number, number, number],
) {
    const w = scaleX(k, width);
    const h = scaleY(k, height);
    const x = scaleX(k, xPosition);
    const y = scaleY(k, yPosition);

    k.add([
        k.rect(w - scaleX(k, SHADOW_INSET_X * 2), h),
        k.pos(
            x + scaleX(k, SHADOW_INSET_X + SHADOW_OFFSET_X),
            y + scaleY(k, SHADOW_OFFSET_Y),
        ),
        k.color(0, 0, 0),
        k.opacity(SHADOW_OPACITY),
        k.z(-1),
    ]);

    k.add([
        k.rect(w, h),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(color[0], color[1], color[2]),
        "platform",
    ]);
}

export function createPlatformsFromDefs(
    k: KAPLAYCtx,
    defs: PlatformDef[],
    color: readonly [number, number, number],
) {
    for (const { width, height, xPosition, yPosition } of defs) {
        addPlatform(k, width, height, xPosition, yPosition, color);
    }
}

const LEVEL1_PLATFORM_DEFS: PlatformDef[] = [
    // Floating platforms left side
    { width: 590, height: PLATFORM_HEIGHT, xPosition: LEFT_WALL_WIDTH, yPosition: 185 },
    { width: 250, height: PLATFORM_HEIGHT, xPosition: 250, yPosition: 555 },
    { width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, xPosition: 0, yPosition: 725 },
    { width: 200, height: 24, xPosition: 250, yPosition: 915 },
    // Floating platforms middle
    { width: 600, height: PLATFORM_HEIGHT, xPosition: 600, yPosition: 375 },
    { width: 600, height: PLATFORM_HEIGHT, xPosition: 600, yPosition: 725 },
    // Floating platforms right side
    {
        width: 550,
        height: PLATFORM_HEIGHT,
        xPosition: DESIGN_WIDTH - RIGHT_WALL_WIDTH - 500,
        yPosition: 185,
    },
    { width: 250, height: PLATFORM_HEIGHT, xPosition: 1420, yPosition: 555 },
    { width: 200, height: 24, xPosition: 1750, yPosition: 725 },
    { width: 200, height: 24, xPosition: 1500, yPosition: 915 },
];

export function createPlatforms(k: KAPLAYCtx) {
    createPlatformsFromDefs(k, LEVEL1_PLATFORM_DEFS, PLATFORM_COLOR);
}
