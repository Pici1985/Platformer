import type { KAPLAYCtx } from "kaplay";
import {
    DESIGN_WIDTH,
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
    scaleX,
    scaleY,
    viewport,
} from "./layout";

const PLATFORM_WIDTH = 150;
const PLATFORM_HEIGHT = 24;
const PLATFORM_COLOR = [139, 90, 43] as const;
const WALL_COLOR = [34, 139, 34] as const;

const SHADOW_OFFSET_X = 0;
const SHADOW_OFFSET_Y = 6;
const SHADOW_INSET_X = 3;
const SHADOW_OPACITY = 0.3;

function addPlatform(
    k: KAPLAYCtx,
    designW: number,
    designH: number,
    designX: number,
    designY: number,
    color: readonly [number, number, number],
) {
    const w = scaleX(k, designW);
    const h = scaleY(k, designH);
    const x = scaleX(k, designX);
    const y = scaleY(k, designY);

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

export function createPlatforms(k: KAPLAYCtx) {
    const { width } = viewport(k);

    // Ground
    k.add([
        k.rect(width, scaleY(k, 20)),
        k.pos(0, scaleY(k, 1060)),
        k.area(),
        k.body({ isStatic: true }),
        k.color(WALL_COLOR[0], WALL_COLOR[1], WALL_COLOR[2]),
        "platform",
    ]);

    // Floating platforms left side
    addPlatform(k, 590, PLATFORM_HEIGHT, LEFT_WALL_WIDTH, 185, PLATFORM_COLOR);
    addPlatform(k, 250, PLATFORM_HEIGHT, 250, 555, PLATFORM_COLOR);
    addPlatform(k, PLATFORM_WIDTH, PLATFORM_HEIGHT, 0, 725, PLATFORM_COLOR);
    addPlatform(k, 200, 24, 250, 915, PLATFORM_COLOR);

    // Floating platforms middle
    addPlatform(k, 600, PLATFORM_HEIGHT, 600, 375, PLATFORM_COLOR);
    addPlatform(k, 600, PLATFORM_HEIGHT, 600, 725, PLATFORM_COLOR);

    // Floating platforms right side
    addPlatform(k, 550, PLATFORM_HEIGHT, DESIGN_WIDTH - RIGHT_WALL_WIDTH - 500, 185, PLATFORM_COLOR);
    addPlatform(k, 250, PLATFORM_HEIGHT, 1420, 555, PLATFORM_COLOR);
    addPlatform(k, 200, 24, 1750, 725, PLATFORM_COLOR);
    addPlatform(k, 200, 24, 1500, 915, PLATFORM_COLOR);
}
