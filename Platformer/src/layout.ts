import type { KAPLAYCtx } from "kaplay";

/** Design resolution used to place platforms and gameplay objects. */
export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export const LEFT_WALL_WIDTH = 10;
export const RIGHT_WALL_WIDTH = 10;

export function viewport(k: KAPLAYCtx) {
    return { width: k.width(), height: k.height() };
}

/** Scale a horizontal value from the design resolution to the current game size. */
export function scaleX(k: KAPLAYCtx, value: number) {
    return value * k.width() / DESIGN_WIDTH;
}

/** Scale a vertical value from the design resolution to the current game size. */
export function scaleY(k: KAPLAYCtx, value: number) {
    return value * k.height() / DESIGN_HEIGHT;
}

/** Scale a sprite/image to cover the viewport (fills screen, may crop edges). */
export function coverSize(
    imgW: number,
    imgH: number,
    viewW: number,
    viewH: number,
) {
    const scale = Math.max(viewW / imgW, viewH / imgH);
    const width = imgW * scale;
    const height = imgH * scale;

    return {
        width,
        height,
        x: (viewW - width) / 2,
        y: (viewH - height) / 2,
    };
}
