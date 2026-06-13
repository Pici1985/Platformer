import type { KAPLAYCtx } from "kaplay";
import { scaleX, scaleY } from "./layout";

export const PLATFORM_WIDTH = 150;
export const PLATFORM_HEIGHT = 24;

export type PlatformDef = {
    width: number;
    height: number;
    xPosition: number;
    yPosition: number;
};

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
