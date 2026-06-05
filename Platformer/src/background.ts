import type { GameObj, KAPLAYCtx } from "kaplay";
import { coverSize, viewport } from "./layout";

export const FLOWERS2K_SPRITE = "flowers2k";
export const KUKAC2K_SPRITE = "kukac2k";

let background: GameObj | null = null;
let currentSprite: string | null = null;

function updateBackground(k: KAPLAYCtx, spriteName: string) {
    const spriteData = k.getSprite(spriteName)?.data;
    if (!spriteData) return;

    const { width: viewW, height: viewH } = viewport(k);
    const { width, height, x, y } = coverSize(
        spriteData.width,
        spriteData.height,
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
        k.sprite(spriteName, { width, height }),
        k.pos(x, y),
        k.anchor("topleft"),
        k.fixed(),
        k.z(-1000),
        "background",
    ]);
}

export function createBackground(
    k: KAPLAYCtx,
    spriteName: string = FLOWERS2K_SPRITE,
) {
    const existing = k.get("background")[0];
    if (existing && currentSprite !== spriteName) {
        existing.destroy();
    }

    background =
        existing && currentSprite === spriteName ? existing : null;
    currentSprite = spriteName;
    updateBackground(k, spriteName);
    k.onResize(() => updateBackground(k, spriteName));
}
