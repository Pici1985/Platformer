import type { KAPLAYCtx } from "kaplay";
import {
    DESIGN_WIDTH,
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
} from "../Base/layout";
import {
    createPlatformsFromDefs,
    PLATFORM_HEIGHT,
    PLATFORM_WIDTH,
    type PlatformDef,
} from "../Base/platforms";

/** Level 2 platform color (design-space positions below). */
const LEVEL2_PLATFORM_COLOR = [255, 0, 255] as const;

/**
 * Level 2 floating platforms in design pixels (1920×1080).
 * Edit width, height, xPosition, yPosition here when placing platforms for this level.
 */
export const LEVEL2_PLATFORM_DEFS: PlatformDef[] = [
    // Floating platforms left side
    { width: 590, height: PLATFORM_HEIGHT, xPosition: LEFT_WALL_WIDTH, yPosition: 185 },
    { width: 250, height: PLATFORM_HEIGHT, xPosition: 250, yPosition: 555 },
    { width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, xPosition: 0, yPosition: 725 },
    { width: 200, height: 24, xPosition: 250, yPosition: 915 },

    // Floating platforms middle
    { width: 600, height: PLATFORM_HEIGHT, xPosition: 600, yPosition: 375 },
    { width: 600, height: PLATFORM_HEIGHT, xPosition: 600, yPosition: 725 },

    // Floating platforms right side
    { width: 550, height: PLATFORM_HEIGHT, xPosition: DESIGN_WIDTH - RIGHT_WALL_WIDTH - 500, yPosition: 185 },
    { width: 250, height: PLATFORM_HEIGHT, xPosition: 1420, yPosition: 555 },
    { width: 200, height: 24, xPosition: 1750, yPosition: 725 },
    { width: 200, height: 24, xPosition: 1500, yPosition: 915 },
];

export function createLevel2Platforms(k: KAPLAYCtx) {
    createPlatformsFromDefs(k, LEVEL2_PLATFORM_DEFS, LEVEL2_PLATFORM_COLOR);
}
