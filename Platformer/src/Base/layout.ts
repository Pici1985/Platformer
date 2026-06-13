import type { KAPLAYCtx } from "kaplay";

/**
 * Design resolution — all layout constants are expressed in this coordinate
 * space and converted to the current viewport via the scale helpers below.
 */
export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export const LEFT_WALL_WIDTH = 10;
export const RIGHT_WALL_WIDTH = 10;
export const TOP_WALL_HEIGHT = 10;

/** Gravity in design pixels per second². */
export const DESIGN_GRAVITY = 1600;

export function viewport(k: KAPLAYCtx) {
    return { width: k.width(), height: k.height() };
}

/** Horizontal scale factor: current viewport width / design width. */
export function scaleFactorX(k: KAPLAYCtx) {
    return k.width() / DESIGN_WIDTH;
}

/** Vertical scale factor: current viewport height / design height. */
export function scaleFactorY(k: KAPLAYCtx) {
    return k.height() / DESIGN_HEIGHT;
}

/**
 * Uniform scale factor that preserves aspect ratio.
 * With letterbox enabled this matches the visual canvas scale.
 */
export function scaleFactor(k: KAPLAYCtx) {
    return Math.min(scaleFactorX(k), scaleFactorY(k));
}

/** Scale a horizontal value from the design resolution to the current game size. */
export function scaleX(k: KAPLAYCtx, value: number) {
    return value * scaleFactorX(k);
}

/** Scale a vertical value from the design resolution to the current game size. */
export function scaleY(k: KAPLAYCtx, value: number) {
    return value * scaleFactorY(k);
}

/** Scale a square or uniform-size value (sprites, coins) preserving proportions. */
export function scaleUniform(k: KAPLAYCtx, value: number) {
    return value * scaleFactor(k);
}

/** Scale physics values (speed, jump force, gravity) with the uniform factor. */
export function scalePhysics(k: KAPLAYCtx, value: number) {
    return value * scaleFactor(k);
}

/** Convert design-space coordinates to current viewport coordinates. */
export function designPos(k: KAPLAYCtx, x: number, y: number) {
    return { x: scaleX(k, x), y: scaleY(k, y) };
}

/** Scale a width/height pair from design pixels to viewport pixels. */
export function scaleSize(k: KAPLAYCtx, width: number, height: number) {
    return { width: scaleX(k, width), height: scaleY(k, height) };
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
