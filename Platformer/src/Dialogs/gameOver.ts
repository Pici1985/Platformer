import type { GameObj, KAPLAYCtx } from "kaplay";
import { scaleX, scaleY } from "../Base/layout";

const HEADER_TEXT = "Game Over";
const HEADER_FONT_SIZE = 36;
const BUTTON_TEXT = "Try Again";
const BUTTON_FONT_SIZE = 24;
const MODAL_PADDING = 40;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 56;

type TextObj = GameObj & { text: string; textSize: number; width: number; height: number };

export function showGameOver(k: KAPLAYCtx, onRetry?: () => void) {
    k.debug.paused = true;

    const retry = onRetry ?? (() => {
        k.debug.paused = false;
        k.go("level1");
    });

    const modal = k.add([
        k.fixed(),
        k.z(3000),
    ]);

    modal.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(0.6),
    ]);

    const dialog = modal.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    const background = dialog.add([
        k.rect(1, 1),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]) as GameObj & { width: number; height: number };

    const headerText = dialog.add([
        k.text(HEADER_TEXT, {
            size: scaleY(k, HEADER_FONT_SIZE),
            align: "center",
        }),
        k.anchor("center"),
        k.color(200, 40, 40),
    ]) as TextObj;

    const button = dialog.add([
        k.rect(1, 1),
        k.anchor("center"),
        k.area({ cursor: "pointer" }),
        k.color(76, 175, 80),
    ]) as GameObj & { width: number; height: number };

    button.add([
        k.text(BUTTON_TEXT, {
            size: scaleY(k, BUTTON_FONT_SIZE),
            align: "center",
        }),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]);

    const layoutDialog = () => {
        dialog.pos = k.center();

        const btnW = scaleX(k, BUTTON_WIDTH);
        const btnH = scaleY(k, BUTTON_HEIGHT);
        const padding = scaleX(k, MODAL_PADDING);
        const headerH = scaleY(k, HEADER_FONT_SIZE + 32);
        const gap = scaleY(k, 24);

        const modalW = Math.max(btnW, headerText.width) + padding * 2;
        const modalH = headerH + gap + btnH + padding * 2;

        background.width = modalW;
        background.height = modalH;

        headerText.textSize = scaleY(k, HEADER_FONT_SIZE);
        headerText.pos = k.vec2(0, -modalH / 2 + padding + headerH / 2);

        button.width = btnW;
        button.height = btnH;
        button.pos = k.vec2(0, -modalH / 2 + padding + headerH + gap + btnH / 2);
    };

    layoutDialog();
    k.onResize(layoutDialog);

    const confirm = () => {
        k.destroy(modal);
        retry();
    };

    button.onClick(confirm);
    const keyEnter = k.onKeyPress("enter", confirm);

    modal.onDestroy(() => {
        keyEnter.cancel();
    });
}
