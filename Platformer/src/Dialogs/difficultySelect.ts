import type { GameObj, KAPLAYCtx, KEventController } from "kaplay";
import { scaleX, scaleY } from "../Base/layout";
import {
    DIFFICULTY_OPTIONS,
    SHOW_DIFFICULTY_INDICATOR,
    type DifficultyId,
} from "../config";

const HEADER_TEXT = "Select difficulty";
const HEADER_FONT_SIZE = 32;
const MODAL_PADDING = 40;
const OPTION_GAP = 32;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 64;
const BUTTON_FONT_SIZE = 24;
const BORDER_WIDTH = 4;
const SELECTED_BORDER_COLOR = [40, 40, 40] as const;
const UNSELECTED_BORDER_COLOR = [180, 180, 180] as const;

type TextObj = GameObj & { text: string; textSize: number; width: number; height: number };

type OptionSlot = {
    id: DifficultyId;
    label: string;
    root: GameObj;
    border: GameObj & { width: number; height: number; color: ReturnType<KAPLAYCtx["rgb"]> };
    button: GameObj & { width: number; height: number; color: ReturnType<KAPLAYCtx["rgb"]> };
    labelText: TextObj;
};

let selectedDifficultyId: DifficultyId = DIFFICULTY_OPTIONS[0].id;

export function setSelectedDifficulty(id: DifficultyId) {
    selectedDifficultyId = id;
}

export function getSelectedDifficulty(): DifficultyId {
    return selectedDifficultyId;
}

export function getSelectedDifficultyLabel(): string {
    return DIFFICULTY_OPTIONS.find((o) => o.id === selectedDifficultyId)?.label ?? "";
}

export function setupDifficultyIndicator(k: KAPLAYCtx) {
    if (!SHOW_DIFFICULTY_INDICATOR) return;

    const option = DIFFICULTY_OPTIONS.find((o) => o.id === selectedDifficultyId);
    if (!option) return;

    const indicator = k.add([
        k.fixed(),
        k.z(100),
        k.pos(k.width() / 2, scaleY(k, 24)),
        k.anchor("top"),
    ]);

    const label = indicator.add([
        k.text(option.label, {
            size: scaleY(k, 28),
            align: "center",
        }),
        k.anchor("center"),
        k.color(...option.color),
    ]) as TextObj;

    const layout = () => {
        indicator.pos = k.vec2(k.width() / 2, scaleY(k, 24));
        label.textSize = scaleY(k, 28);
    };

    layout();
    k.onResize(layout);
}

export function showDifficultySelect(
    k: KAPLAYCtx,
    onSelect: (difficultyId: DifficultyId) => void,
) {
    k.debug.paused = true;

    let selectedIndex = DIFFICULTY_OPTIONS.findIndex((o) => o.id === selectedDifficultyId);
    if (selectedIndex < 0) selectedIndex = 0;

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
        k.pos(0, 0),
        k.anchor("center"),
        k.color(40, 40, 40),
    ]) as TextObj;

    const optionsRow = dialog.add([
        k.pos(0, 0),
        k.anchor("center"),
    ]);

    let acceptingInput = false;

    const enableInput = () => {
        if (acceptingInput) return;
        acceptingInput = true;
        releaseHandlers.forEach((handler) => handler.cancel());
    };

    const releaseHandlers: KEventController[] = [
        k.onMouseRelease(enableInput),
        k.onTouchEnd(enableInput),
        k.onKeyRelease("enter", enableInput),
        k.onKeyRelease("space", enableInput),
    ];

    const slots: OptionSlot[] = DIFFICULTY_OPTIONS.map((option) => {
        const slotRoot = optionsRow.add([
            k.pos(0, 0),
            k.anchor("center"),
        ]);

        const border = slotRoot.add([
            k.rect(1, 1),
            k.anchor("center"),
            k.color(...UNSELECTED_BORDER_COLOR),
        ]) as OptionSlot["border"];

        const button = slotRoot.add([
            k.rect(1, 1),
            k.anchor("center"),
            k.area({ cursor: "pointer" }),
            k.color(...option.color),
        ]) as OptionSlot["button"];

        const labelText = slotRoot.add([
            k.text(option.label, {
                size: scaleY(k, BUTTON_FONT_SIZE),
                align: "center",
            }),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]) as TextObj;

        return {
            id: option.id,
            label: option.label,
            root: slotRoot,
            border,
            button,
            labelText,
        };
    });

    const updateSelection = () => {
        slots.forEach((slot, i) => {
            const selected = i === selectedIndex;
            const borderColor = selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR;
            slot.border.color = k.rgb(borderColor[0], borderColor[1], borderColor[2]);
        });
    };

    const layoutDialog = () => {
        dialog.pos = k.center();

        const btnW = scaleX(k, BUTTON_WIDTH);
        const btnH = scaleY(k, BUTTON_HEIGHT);
        const borderW = scaleX(k, BORDER_WIDTH);
        const gap = scaleX(k, OPTION_GAP);
        const padding = scaleX(k, MODAL_PADDING);
        const headerH = scaleY(k, HEADER_FONT_SIZE + 24);
        const fontSize = scaleY(k, BUTTON_FONT_SIZE);

        const slotW = btnW + borderW * 2;
        const slotH = btnH + borderW * 2;
        const totalRowWidth = slotW * slots.length + gap * (slots.length - 1);

        const modalW = totalRowWidth + padding * 2;
        const modalH = slotH + padding * 2 + headerH;

        background.width = modalW;
        background.height = modalH;

        headerText.textSize = scaleY(k, HEADER_FONT_SIZE);
        headerText.pos = k.vec2(0, -modalH / 2 + padding + headerH / 2);

        optionsRow.pos = k.vec2(0, -modalH / 2 + padding + headerH + slotH / 2);

        let x = -totalRowWidth / 2;
        slots.forEach((slot) => {
            slot.root.pos = k.vec2(x + slotW / 2, 0);
            slot.border.width = slotW;
            slot.border.height = slotH;
            slot.button.width = btnW;
            slot.button.height = btnH;
            slot.labelText.textSize = fontSize;
            x += slotW + gap;
        });
    };

    layoutDialog();
    updateSelection();
    k.onResize(layoutDialog);

    const confirm = () => {
        if (!acceptingInput) return;

        const difficultyId = slots[selectedIndex].id;
        setSelectedDifficulty(difficultyId);
        k.debug.paused = false;
        k.destroy(modal);
        onSelect(difficultyId);
    };

    const keyLeft = k.onKeyPress("left", () => {
        selectedIndex = (selectedIndex - 1 + slots.length) % slots.length;
        updateSelection();
    });

    const keyRight = k.onKeyPress("right", () => {
        selectedIndex = (selectedIndex + 1) % slots.length;
        updateSelection();
    });

    const keyEnter = k.onKeyPress("enter", confirm);

    const clickHandlers: KEventController[] = slots.map((slot, i) =>
        slot.button.onClick(() => {
            if (!acceptingInput) return;
            selectedIndex = i;
            confirm();
        }),
    );

    if (!k.isMouseDown() && !k.isKeyDown("enter") && !k.isKeyDown("space")) {
        enableInput();
    }

    modal.onDestroy(() => {
        releaseHandlers.forEach((handler) => handler.cancel());
        keyLeft.cancel();
        keyRight.cancel();
        keyEnter.cancel();
        clickHandlers.forEach((handler) => handler.cancel());
    });
}
