import type { GameObj, KAPLAYCtx } from "kaplay";
import arrowToUseUrl from "../images/arrowOneNoBg.png";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./layout";
import {
    getPlayerOneControls,
    jumpPlayer,
    movePlayerLeft,
    movePlayerRight,
} from "./player";

const BUTTON_RADIUS_PX = 76;
const BUTTON_MARGIN_PX = 36;
const BUTTON_GAP_PX = 20;
const BUTTON_OPACITY = 0.45;
const MIN_LETTERBOX_PX = 40;
const OVERLAY_Z_INDEX = 1500;

type ButtonLayout = {
    left: { x: number; y: number };
    right: { x: number; y: number };
    jump: { x: number; y: number };
    radius: number;
};

type ArrowDirection = "left" | "right" | "up";

let activeOverlay: HTMLElement | null = null;

/** True on phones/tablets where touch is the primary input. */
export function shouldShowTouchControls() {
    if (typeof window === "undefined") return false;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    const hasTouch = navigator.maxTouchPoints > 0;

    return hasTouch && (coarsePointer || noHover);
}

export function loadTouchControlAssets(_k: KAPLAYCtx) {
    // Arrow image is bundled via the import above for the HTML overlay.
}

function getGameViewport(canvasW: number, canvasH: number) {
    const gameAspect = DESIGN_WIDTH / DESIGN_HEIGHT;
    const viewAspect = canvasW / canvasH;

    if (viewAspect > gameAspect) {
        const gameH = canvasH;
        const gameW = canvasH * gameAspect;
        return {
            gameLeft: (canvasW - gameW) / 2,
            gameTop: 0,
            gameW,
            gameH,
            bottomBar: 0,
            leftBar: (canvasW - gameW) / 2,
            rightBar: (canvasW - gameW) / 2,
        };
    }

    const gameW = canvasW;
    const gameH = canvasW / gameAspect;
    const barY = (canvasH - gameH) / 2;

    return {
        gameLeft: 0,
        gameTop: barY,
        gameW,
        gameH,
        bottomBar: barY,
        leftBar: 0,
        rightBar: 0,
    };
}

/** Place buttons in letterbox dead zones when available, otherwise game corners. */
function computeButtonLayout(canvasW: number, canvasH: number): ButtonLayout {
    const margin = BUTTON_MARGIN_PX;
    const gap = BUTTON_GAP_PX;
    const radius = Math.min(
        BUTTON_RADIUS_PX,
        Math.max(48, Math.min(canvasW, canvasH) * 0.09),
    );
    const rowStep = radius * 2 + gap;
    const view = getGameViewport(canvasW, canvasH);

    if (view.bottomBar >= MIN_LETTERBOX_PX) {
        const barCenterY = view.gameTop + view.gameH + view.bottomBar / 2;
        const leftX = margin + radius;

        return {
            left: { x: leftX, y: barCenterY },
            right: { x: leftX + rowStep, y: barCenterY },
            jump: { x: canvasW - margin - radius, y: barCenterY },
            radius,
        };
    }

    if (view.leftBar >= MIN_LETTERBOX_PX || view.rightBar >= MIN_LETTERBOX_PX) {
        const bottomY = canvasH - margin - radius;
        const pairStartX =
            view.leftBar >= MIN_LETTERBOX_PX
                ? (view.leftBar - rowStep) / 2 + radius
                : view.gameLeft + margin + radius;
        const jumpX =
            view.rightBar >= MIN_LETTERBOX_PX
                ? view.gameLeft + view.gameW + view.rightBar / 2
                : canvasW - margin - radius;

        return {
            left: { x: pairStartX, y: bottomY },
            right: { x: pairStartX + rowStep, y: bottomY },
            jump: { x: jumpX, y: bottomY },
            radius,
        };
    }

    const bottomY = view.gameTop + view.gameH - margin - radius;
    const leftX = view.gameLeft + margin + radius;

    return {
        left: { x: leftX, y: bottomY },
        right: { x: leftX + rowStep, y: bottomY },
        jump: {
            x: view.gameLeft + view.gameW - margin - radius,
            y: bottomY,
        },
        radius,
    };
}

function arrowTransform(direction: ArrowDirection) {
    switch (direction) {
        case "right":
            return "";
        case "left":
            return "scaleX(-1)";
        case "up":
            return "rotate(-90deg)";
    }
}

function removeOverlay() {
    activeOverlay?.remove();
    activeOverlay = null;
}

function createArrowButton(direction: ArrowDirection) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `touch-btn touch-btn-${direction}`;
    button.setAttribute("aria-label", direction);

    const icon = document.createElement("img");
    icon.src = arrowToUseUrl;
    icon.alt = "";
    icon.draggable = false;
    icon.style.transform = arrowTransform(direction);

    button.appendChild(icon);
    return button;
}

function applyButtonLayout(
    buttons: Record<ArrowDirection, HTMLButtonElement>,
    layout: ButtonLayout,
) {
    const size = layout.radius * 2;
    const iconSize = Math.round(layout.radius * 1.1);

    for (const [direction, pos] of [
        ["left", layout.left],
        ["right", layout.right],
        ["up", layout.jump],
    ] as const) {
        const button = buttons[direction];
        button.style.width = `${size}px`;
        button.style.height = `${size}px`;
        button.style.left = `${pos.x - layout.radius}px`;
        button.style.top = `${pos.y - layout.radius}px`;

        const icon = button.querySelector("img");
        if (icon) {
            icon.style.width = `${iconSize}px`;
            icon.style.height = `${iconSize}px`;
        }
    }
}

function mountTouchOverlay() {
    if (!document.getElementById("touch-controls-styles")) {
        const style = document.createElement("style");
        style.id = "touch-controls-styles";
        style.textContent = `
            #touch-controls-overlay {
                position: fixed;
                pointer-events: none;
                z-index: ${OVERLAY_Z_INDEX};
            }
            #touch-controls-overlay .touch-btn {
                position: absolute;
                border: none;
                border-radius: 50%;
                padding: 0;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, ${BUTTON_OPACITY});
                pointer-events: auto;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                cursor: pointer;
            }
            #touch-controls-overlay .touch-btn img {
                object-fit: contain;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement("div");
    overlay.id = "touch-controls-overlay";

    return overlay;
}

function syncOverlayToCanvas(
    overlay: HTMLElement,
    buttons: Record<ArrowDirection, HTMLButtonElement>,
    canvas: HTMLCanvasElement,
) {
    const rect = canvas.getBoundingClientRect();
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    applyButtonLayout(buttons, computeButtonLayout(rect.width, rect.height));
}

export function setupTouchControls(k: KAPLAYCtx, player: GameObj) {
    if (!shouldShowTouchControls()) return;

    removeOverlay();

    const controls = getPlayerOneControls(k);
    const overlay = mountTouchOverlay();

    const buttons = {
        left: createArrowButton("left"),
        right: createArrowButton("right"),
        up: createArrowButton("up"),
    };

    overlay.append(buttons.left, buttons.right, buttons.up);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    let leftHeld = false;
    let rightHeld = false;

    const holdLeft = () => {
        leftHeld = true;
        rightHeld = false;
    };
    const holdRight = () => {
        rightHeld = true;
        leftHeld = false;
    };
    const releaseHold = () => {
        leftHeld = false;
        rightHeld = false;
    };

    const onJump = () =>
        jumpPlayer(k, player, controls.jumpForce, controls.jumpSoundIsDoggy);

    const addHoldListeners = (
        button: HTMLButtonElement,
        onPress: () => void,
    ) => {
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            onPress();
        });
        button.addEventListener("pointerup", releaseHold);
        button.addEventListener("pointercancel", releaseHold);
        button.addEventListener("pointerleave", releaseHold);
    };

    addHoldListeners(buttons.left, holdLeft);
    addHoldListeners(buttons.right, holdRight);
    buttons.up.addEventListener("click", onJump);

    const layoutOverlay = () => syncOverlayToCanvas(overlay, buttons, k.canvas);
    layoutOverlay();

    k.onResize(layoutOverlay);

    const updateController = k.onUpdate(() => {
        if (leftHeld) movePlayerLeft(player, controls.speed);
        if (rightHeld) movePlayerRight(player, controls.speed);
    });

    const resizeObserver = new ResizeObserver(layoutOverlay);
    resizeObserver.observe(k.canvas);

    const marker = k.add([k.fixed(), "touchControlsMarker"]);
    marker.onDestroy(() => {
        resizeObserver.disconnect();
        updateController.cancel();
        removeOverlay();
    });
}
