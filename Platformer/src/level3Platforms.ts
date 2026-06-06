import type { KAPLAYCtx } from "kaplay";
import { createPlatformsFromDefs } from "./platforms";
import { LEVEL2_PLATFORM_DEFS } from "./level2Platforms";

const LEVEL3_PLATFORM_COLOR = [255, 255, 255] as const;

export function createLevel3Platforms(k: KAPLAYCtx) {
    createPlatformsFromDefs(k, LEVEL2_PLATFORM_DEFS, LEVEL3_PLATFORM_COLOR);
}
