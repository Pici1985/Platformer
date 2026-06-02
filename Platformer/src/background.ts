import type { GameObj, KAPLAYCtx } from "kaplay";
import { coverSize, viewport } from "./layout";

const FLOWERS2K_SPRITE = "flowers2k";

let background: GameObj | null = null;

function updateBackground(k: KAPLAYCtx) {
    const flowers = k.getSprite(FLOWERS2K_SPRITE)?.data;
    if (!flowers) return;

    const { width: viewW, height: viewH } = viewport(k);
    const { width, height, x, y } = coverSize(
        flowers.width,
        flowers.height,
        viewW,
        viewH,
    );

    if (background) {
        background.width = width;
        background.height = height;
        background.pos = k.vec2(x, y);
        return;
    }

    background = k.add([
        k.sprite(FLOWERS2K_SPRITE, { width, height }),
        k.pos(x, y),
        k.anchor("topleft"),
        k.fixed(),
        k.z(-1000),
        "background",
    ]);
}

export function createBackground(k: KAPLAYCtx) {
    updateBackground(k);
    k.onResize(() => updateBackground(k));
}
