import type { KAPLAYCtx } from "kaplay";
import {
    LEFT_WALL_WIDTH,
    RIGHT_WALL_WIDTH,
    scaleX,
    scaleY,
    viewport,
} from "./layout";

const WALL_COLOR = [34, 139, 34] as const;

/** Ground strip height and Y in design resolution (1080px tall). */
const GROUND_HEIGHT = 20;
const GROUND_Y = 1060;

export function createWalls(k: KAPLAYCtx) {
    const { width, height } = viewport(k);
    const leftWidth = scaleX(k, LEFT_WALL_WIDTH);
    const rightWidth = scaleX(k, RIGHT_WALL_WIDTH);

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

    k.add([
        k.rect(width, scaleY(k, GROUND_HEIGHT)),
        k.pos(0, scaleY(k, GROUND_Y)),
        k.area(),
        k.body({ isStatic: true }),
        k.color(WALL_COLOR[0], WALL_COLOR[1], WALL_COLOR[2]),
        "platform",
    ]);
}
