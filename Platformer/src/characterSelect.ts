import type { GameObj, KAPLAYCtx, KEventController } from "kaplay";
import meowSoundUrl from "../sounds/meow.mp3";
import woof2SoundUrl from "../sounds/woof2.mp3";
import { scaleX, scaleY } from "./layout";
import {
    CHARACTER_OPTIONS,
    type PlayerCharacterId,
    setSelectedCharacter,
} from "./player";

export function loadCharacterSelectSounds(k: KAPLAYCtx) {
    k.loadSound("characterSelectWoof", woof2SoundUrl);
    k.loadSound("characterSelectMeow", meowSoundUrl);
}

function playSelectionSound(k: KAPLAYCtx, characterId: PlayerCharacterId) {
    void k.audioCtx.resume();
    k.play(characterId === "doggy" ? "characterSelectWoof" : "characterSelectMeow");
}

const HEADER_TEXT = "Select character";
const HEADER_FONT_SIZE = 32;
const MODAL_PADDING = 40;
const OPTION_GAP = 48;
const PREVIEW_HEIGHT = 120;
const BORDER_WIDTH = 4;
const SELECTED_BORDER_COLOR = [76, 175, 80] as const;
const UNSELECTED_BORDER_COLOR = [180, 180, 180] as const;

type TextObj = GameObj & { text: string; textSize: number; width: number; height: number };

type OptionSlot = {
    id: PlayerCharacterId;
    root: GameObj;
    border: GameObj & { width: number; height: number; color: ReturnType<KAPLAYCtx["rgb"]> };
    sprite: GameObj & { width: number; height: number };
    previewWidth: number;
    previewHeight: number;
};

export function showCharacterSelect(
    k: KAPLAYCtx,
    onSelect: (characterId: PlayerCharacterId) => void,
) {
    k.debug.paused = true;

    let selectedIndex = 0;

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

    const slots: OptionSlot[] = CHARACTER_OPTIONS.map((option) => {
        const slotRoot = optionsRow.add([
            k.pos(0, 0),
            k.anchor("center"),
        ]);

        const border = slotRoot.add([
            k.rect(1, 1),
            k.anchor("center"),
            k.area({ cursor: "pointer" }),
            k.color(...UNSELECTED_BORDER_COLOR),
        ]) as OptionSlot["border"];

        const sprite = slotRoot.add([
            k.sprite(option.sprite, { width: 1, height: 1 }),
            k.anchor("center"),
        ]) as OptionSlot["sprite"];

        return {
            id: option.id,
            root: slotRoot,
            border,
            sprite,
            previewWidth: option.previewWidth,
            previewHeight: option.previewHeight,
        };
    });

    const updateSelection = () => {
        slots.forEach((slot, i) => {
            const selected = i === selectedIndex;
            const color = selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR;
            slot.border.color = k.rgb(color[0], color[1], color[2]);
        });
        playSelectionSound(k, slots[selectedIndex].id);
    };

    const layoutDialog = () => {
        dialog.pos = k.center();

        const previewH = scaleY(k, PREVIEW_HEIGHT);
        const borderW = scaleX(k, BORDER_WIDTH);
        const gap = scaleX(k, OPTION_GAP);
        const padding = scaleX(k, MODAL_PADDING);
        const headerH = scaleY(k, HEADER_FONT_SIZE + 24);

        let totalRowWidth = 0;
        const slotWidths = slots.map((slot) => {
            const aspect = slot.previewWidth / slot.previewHeight;
            const spriteW = previewH * aspect;
            const slotW = spriteW + borderW * 2;
            totalRowWidth += slotW;
            return { spriteW, slotW };
        });
        totalRowWidth += gap * (slots.length - 1);

        const modalW = totalRowWidth + padding * 2;
        const modalH = previewH + borderW * 2 + padding * 2 + headerH;

        background.width = modalW;
        background.height = modalH;

        headerText.textSize = scaleY(k, HEADER_FONT_SIZE);
        headerText.pos = k.vec2(0, -modalH / 2 + padding + headerH / 2);

        optionsRow.pos = k.vec2(0, -modalH / 2 + padding + headerH + (previewH + borderW * 2) / 2);

        let x = -totalRowWidth / 2;
        slots.forEach((slot, i) => {
            const { spriteW, slotW } = slotWidths[i];
            slot.root.pos = k.vec2(x + slotW / 2, 0);
            slot.border.width = slotW;
            slot.border.height = previewH + borderW * 2;
            slot.sprite.width = spriteW;
            slot.sprite.height = previewH;
            x += slotW + gap;
        });
    };

    layoutDialog();
    updateSelection();
    k.onResize(layoutDialog);

    const confirm = () => {
        const characterId = slots[selectedIndex].id;
        setSelectedCharacter(characterId);
        k.debug.paused = false;
        k.destroy(modal);
        onSelect(characterId);
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
        slot.border.onClick(() => {
            selectedIndex = i;
            confirm();
        }),
    );

    modal.onDestroy(() => {
        keyLeft.cancel();
        keyRight.cancel();
        keyEnter.cancel();
        clickHandlers.forEach((handler) => handler.cancel());
    });
}
