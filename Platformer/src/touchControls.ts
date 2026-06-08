import type { GameObj, KAPLAYCtx, KEventController, Vec2 } from "kaplay";
import arrowToUseUrl from "../images/arrowOneNoBg.png";
import { scaleUniform } from "./layout";
import {
    getPlayerOneControls,
    jumpPlayer,
    movePlayerLeft,
    movePlayerRight,
} from "./player";

export const ARROW_SPRITE = "arrowToUse";

const BUTTON_RADIUS = 56;
const BUTTON_MARGIN = 40;
const BUTTON_GAP = 24;
const BUTTON_OPACITY = 0.45;
const ARROW_ICON_SIZE = 36;
const CONTROLS_Z = 1500;

type ArrowDirection = "left" | "right" | "up";

type ArrowIcon = GameObj & {
    width: number;
    height: number;
    angle: number;
    flipX: boolean;
};
type RoundButton = GameObj & { radius: number; pos: Vec2 };

export function loadTouchControlAssets(k: KAPLAYCtx) {
    k.loadSprite(ARROW_SPRITE, arrowToUseUrl);
}

function arrowTransform(direction: ArrowDirection) {
    switch (direction) {
        case "right":
            return { angle: 0, flipX: false };
        case "left":
            return { angle: 0, flipX: true };
        case "up":
            return { angle: -90, flipX: false };
    }
}

function pointInButton(btn: RoundButton, pos: Vec2) {
    return btn.pos.dist(pos) <= btn.radius;
}

function createRoundButton(
    k: KAPLAYCtx,
    parent: GameObj,
    direction: ArrowDirection,
    radius: number,
) {
    const { angle, flipX } = arrowTransform(direction);
    const iconSize = scaleUniform(k, ARROW_ICON_SIZE);

    const btn = parent.add([
        k.pos(0, 0),
        k.anchor("center"),
        k.circle(radius),
        k.color(255, 255, 255),
        k.opacity(BUTTON_OPACITY),
        k.area(),
    ]) as RoundButton;

    btn.radius = radius;

    const icon = btn.add([
        k.sprite(ARROW_SPRITE, { width: iconSize, height: iconSize, flipX }),
        k.rotate(angle),
        k.anchor("center"),
    ]) as ArrowIcon;

    return { btn, icon };
}

export function setupTouchControls(k: KAPLAYCtx, player: GameObj) {
    const controls = getPlayerOneControls(k);

    const root = k.add([k.fixed(), k.z(CONTROLS_Z)]);

    let leftBtn!: RoundButton;
    let rightBtn!: RoundButton;
    let jumpBtn!: RoundButton;
    let leftIcon!: ArrowIcon;
    let rightIcon!: ArrowIcon;
    let jumpIcon!: ArrowIcon;

    let leftHeld = false;
    let rightHeld = false;

    const layoutButtons = () => {
        const radius = scaleUniform(k, BUTTON_RADIUS);
        const margin = scaleUniform(k, BUTTON_MARGIN);
        const gap = scaleUniform(k, BUTTON_GAP);
        const iconSize = scaleUniform(k, ARROW_ICON_SIZE);
        const bottomY = k.height() - margin - radius;
        const leftX = margin + radius;

        for (const [btn, icon, pos] of [
            [leftBtn, leftIcon, k.vec2(leftX, bottomY)],
            [rightBtn, rightIcon, k.vec2(leftX + radius * 2 + gap, bottomY)],
            [jumpBtn, jumpIcon, k.vec2(k.width() - margin - radius, bottomY)],
        ] as const) {
            btn.radius = radius;
            btn.pos = pos;
            icon.width = iconSize;
            icon.height = iconSize;
        }
    };

    ({ btn: leftBtn, icon: leftIcon } = createRoundButton(
        k,
        root,
        "left",
        scaleUniform(k, BUTTON_RADIUS),
    ));
    ({ btn: rightBtn, icon: rightIcon } = createRoundButton(
        k,
        root,
        "right",
        scaleUniform(k, BUTTON_RADIUS),
    ));
    ({ btn: jumpBtn, icon: jumpIcon } = createRoundButton(
        k,
        root,
        "up",
        scaleUniform(k, BUTTON_RADIUS),
    ));

    jumpBtn.onClick(() =>
        jumpPlayer(k, player, controls.jumpForce, controls.jumpSoundIsDoggy),
    );

    const setLeftHeld = (held: boolean) => {
        leftHeld = held;
    };

    const setRightHeld = (held: boolean) => {
        rightHeld = held;
    };

    const handlePointerDown = (pos: Vec2) => {
        if (pointInButton(leftBtn, pos)) {
            setLeftHeld(true);
            setRightHeld(false);
            return;
        }
        if (pointInButton(rightBtn, pos)) {
            setRightHeld(true);
            setLeftHeld(false);
        }
    };

    const handlePointerUp = () => {
        setLeftHeld(false);
        setRightHeld(false);
    };

    const controllers: KEventController[] = [
        k.onTouchStart((pos) => handlePointerDown(pos)),
        k.onTouchEnd(() => handlePointerUp()),
        k.onMouseDown(() => handlePointerDown(k.mousePos())),
        k.onMouseRelease(() => handlePointerUp()),
        k.onUpdate(() => {
            if (leftHeld) movePlayerLeft(player, controls.speed);
            if (rightHeld) movePlayerRight(player, controls.speed);
        }),
    ];

    layoutButtons();
    k.onResize(layoutButtons);

    root.onDestroy(() => {
        controllers.forEach((c) => c.cancel());
    });
}
