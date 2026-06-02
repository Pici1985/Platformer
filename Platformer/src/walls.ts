import type { KAPLAYCtx } from "kaplay";
import {
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
    scaleX,
    viewport,
} from "./layout";

export function createWalls(k: KAPLAYCtx) {
    const { width, height } = viewport(k);
    const leftWidth = scaleX(k, LEFT_WALL_WIDTH);
    const rightWidth = scaleX(k, RIGHT_WALL_WIDTH);
    const WALL_COLOR = [34, 139, 34];

    k.add([
        k.rect(leftWidth, height),
        k.pos(0, 0),
        k.area(),
        k.body({ isStatic: true }),
        k.color(WALL_COLOR[0], WALL_COLOR[1], WALL_COLOR[2]),
        "platform",
    ]);

    k.add([
        k.rect(rightWidth, height),
        k.pos(width - rightWidth, 0),
        k.area(),
        k.body({ isStatic: true }),
        k.color(WALL_COLOR[0], WALL_COLOR[1], WALL_COLOR[2]),
        "platform",
    ]);
}
