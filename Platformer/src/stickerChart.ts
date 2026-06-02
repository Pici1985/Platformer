import type { GameObj, KAPLAYCtx } from "kaplay";
import stickerChartSUrl from "../images/stickerChartS.png";
import popupSoundUrl from "../sounds/popup.wav";
import {
    BLUE_COIN_SPRITE,
    CHART_COIN_SIZE,
    GOLD_COIN_SPRITE,
    GREEN_COIN_SPRITE,
    RED_COIN_SPRITE,
} from "./coins";
import {
    ALWAYS_SHOW_STICKER_CHART,
    CHART_COIN_SPAWN_DELAY_SEC,
    COINS_TO_WIN,
} from "./config";
import { scaleX, scaleY } from "./layout";

export const STICKER_CHART_WIDTH = 432;
export const STICKER_CHART_HEIGHT = 648;
export const MODAL_HEADER_HEIGHT = 60;
export const MODAL_FOOTER_HEIGHT = 60;
export const MODAL_WIDTH = STICKER_CHART_WIDTH;
export const MODAL_HEIGHT = STICKER_CHART_HEIGHT + MODAL_HEADER_HEIGHT + MODAL_FOOTER_HEIGHT;

const COUNTER_FONT_SIZE = 32;
const COUNTER_TOP_MARGIN = 24;
const HEADER_FONT_SIZE = 28;
const BUTTON_FONT_SIZE = 24;

const HEADER_TEXT = "Level Complete!!";
const BUTTON_TEXT = "Next Level";
const NEXT_LEVEL_SCENE = "nextLevel";

type TextObj = GameObj & { text: string; textSize: number; width: number; height: number };
type ChartCoinObj = GameObj & { width: number; height: number; pos: { x: number; y: number } };

type ChartCoinSlot = {
    sprite: string;
    /** Offset from chart center in design pixels (432×648 artboard). */
    x: number;
    y: number;
};

/**
 * Per-coin placement on the sticker chart. Edit x/y for each slot; values are
 * relative to the chart sprite (center = 0,0; left/top are negative).
 */
const CHART_COIN_SLOTS: ChartCoinSlot[] = [
    { sprite: BLUE_COIN_SPRITE, x: -175, y: -275 },
    { sprite: GOLD_COIN_SPRITE, x: -185, y: -185 },
    { sprite: GREEN_COIN_SPRITE, x: -185, y: -80 },
    { sprite: RED_COIN_SPRITE, x: -185, y: -5 },
    { sprite: BLUE_COIN_SPRITE, x: -190, y: 95 },

    { sprite: GOLD_COIN_SPRITE, x: -75, y: -275 },
    { sprite: GREEN_COIN_SPRITE, x: -70, y: -195 },
    { sprite: RED_COIN_SPRITE, x: -60, y: -100 },
    { sprite: BLUE_COIN_SPRITE, x: -60, y: -20 },
    { sprite: GOLD_COIN_SPRITE, x: -50, y: 105 },

    { sprite: GREEN_COIN_SPRITE, x: 36, y: -285 },
    { sprite: RED_COIN_SPRITE, x: 36, y: -195 },
    { sprite: BLUE_COIN_SPRITE, x: 45, y: -125 },
    { sprite: GOLD_COIN_SPRITE, x: 55, y: -40 },
    { sprite: GREEN_COIN_SPRITE, x: 75, y: 20 },

    { sprite: RED_COIN_SPRITE, x: 150, y: -275 },
    { sprite: BLUE_COIN_SPRITE, x: 155, y: -195 },
    { sprite: GOLD_COIN_SPRITE, x: 160, y: -130 },
    { sprite: GREEN_COIN_SPRITE, x: 160, y: -65 },
    { sprite: RED_COIN_SPRITE, x: 160, y: 30 },
];

export function loadStickerChartAssets(k: KAPLAYCtx) {
    k.loadSprite("stickerChartS", stickerChartSUrl);
    k.loadSound("chartCoinPopup", popupSoundUrl);
}

/** debug.paused suspends the Web Audio context; resume before one-shot UI sounds. */
function playChartCoinPopup(k: KAPLAYCtx) {
    void k.audioCtx.resume();
    k.play("chartCoinPopup");
}

function startChartCoinReveal(
    k: KAPLAYCtx,
    modal: GameObj,
    coins: ChartCoinObj[],
    delaySec: number,
) {
    let revealed = 0;
    const startMs = performance.now();
    let rafId = 0;

    const tick = () => {
        const elapsedSec = (performance.now() - startMs) / 1000;
        while (revealed < coins.length && elapsedSec >= revealed * delaySec) {
            coins[revealed].opacity = 1;
            playChartCoinPopup(k);
            revealed++;
        }

        if (revealed < coins.length) {
            rafId = requestAnimationFrame(tick);
        }
    };

    rafId = requestAnimationFrame(tick);

    modal.onDestroy(() => {
        cancelAnimationFrame(rafId);
    });
}

export function setupCollectionUI(k: KAPLAYCtx) {
    let collected = 0;
    let modalShown = false;

    const counter = k.add([
        k.pos(k.center().x, scaleY(k, COUNTER_TOP_MARGIN + COUNTER_FONT_SIZE / 2)),
        k.fixed(),
        k.z(1000),
    ]);

    const counterBg = counter.add([
        k.rect(1, 1),
        k.anchor("center"),
        k.color(0, 0, 0),
        k.opacity(0.55),
    ]) as GameObj & { width: number; height: number };

    const counterLabel = counter.add([
        k.text(`collected: 0/${COINS_TO_WIN}`, {
            size: scaleY(k, COUNTER_FONT_SIZE),
            align: "center",
        }),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]) as TextObj;

    const layoutCounter = () => {
        counter.pos = k.vec2(k.center().x, scaleY(k, COUNTER_TOP_MARGIN + COUNTER_FONT_SIZE / 2));
        counterLabel.textSize = scaleY(k, COUNTER_FONT_SIZE);

        const padding = scaleY(k, 12);
        counterBg.width = counterLabel.width + padding * 2;
        counterBg.height = counterLabel.height + padding;
    };

    const updateCounter = () => {
        counterLabel.text = `collected: ${collected}/${COINS_TO_WIN}`;
        layoutCounter();
    };

    const showWinModal = (preview = false) => {
        if (modalShown) return;
        modalShown = true;
        if (!preview) {
            k.debug.paused = true;
        }

        const modal = k.add([
            k.fixed(),
            k.z(2000),
        ]);

        if (!preview) {
            modal.add([
                k.rect(k.width(), k.height()),
                k.pos(0, 0),
                k.color(0, 0, 0),
                k.opacity(0.6),
            ]);
        }

        const dialog = modal.add([
            k.pos(k.center()),
            k.anchor("center"),
        ]);

        const background = dialog.add([
            k.rect(1, 1),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]) as GameObj & { width: number; height: number };

        const header = dialog.add([
            k.rect(1, 1),
            k.pos(0, 0),
            k.anchor("center"),
            k.color(245, 245, 245),
        ]) as GameObj & { width: number; height: number; pos: { x: number; y: number } };

        const headerText = dialog.add([
            k.text(HEADER_TEXT, {
                size: scaleY(k, HEADER_FONT_SIZE),
                align: "center",
            }),
            k.pos(0, 0),
            k.anchor("center"),
            k.color(40, 40, 40),
        ]) as TextObj;

        const chart = dialog.add([
            k.sprite("stickerChartS", { width: 1, height: 1 }),
            k.pos(0, 0),
            k.anchor("center"),
        ]) as GameObj & { width: number; height: number; pos: { x: number; y: number } };

        const chartCoins = CHART_COIN_SLOTS.map((slot) =>
            chart.add([
                k.sprite(slot.sprite, { width: CHART_COIN_SIZE, height: CHART_COIN_SIZE }),
                k.pos(slot.x, slot.y),
                k.anchor("center"),
                k.opacity(0),
            ]) as ChartCoinObj,
        );

        const footer = dialog.add([
            k.rect(1, 1),
            k.pos(0, 0),
            k.anchor("center"),
            k.color(245, 245, 245),
        ]) as GameObj & { width: number; height: number; pos: { x: number; y: number } };

        const nextButton = footer.add([
            k.rect(1, 1),
            k.anchor("center"),
            k.area({ cursor: "pointer" }),
            k.color(76, 175, 80),
        ]) as GameObj & { width: number; height: number };

        nextButton.add([
            k.text(BUTTON_TEXT, {
                size: scaleY(k, BUTTON_FONT_SIZE),
                align: "center",
            }),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        nextButton.onClick(() => {
            k.debug.paused = false;
            k.go(NEXT_LEVEL_SCENE);
        });

        const layoutDialog = () => {
            dialog.pos = k.center();

            const modalW = scaleX(k, MODAL_WIDTH);
            const modalH = scaleY(k, MODAL_HEIGHT);
            const headerH = scaleY(k, MODAL_HEADER_HEIGHT);
            const footerH = scaleY(k, MODAL_FOOTER_HEIGHT);
            const chartW = scaleX(k, STICKER_CHART_WIDTH);
            const chartH = scaleY(k, STICKER_CHART_HEIGHT);

            background.width = modalW;
            background.height = modalH;

            header.width = modalW;
            header.height = headerH;
            header.pos = k.vec2(0, -modalH / 2 + headerH / 2);

            headerText.textSize = scaleY(k, HEADER_FONT_SIZE);
            headerText.pos = header.pos;

            chart.width = chartW;
            chart.height = chartH;
            chart.pos = k.vec2(0, -modalH / 2 + headerH + chartH / 2);

            const chartCoinW = scaleX(k, CHART_COIN_SIZE);
            const chartCoinH = scaleY(k, CHART_COIN_SIZE);
            const scaleChartX = chartW / STICKER_CHART_WIDTH;
            const scaleChartY = chartH / STICKER_CHART_HEIGHT;

            chartCoins.forEach((coin, i) => {
                const slot = CHART_COIN_SLOTS[i];
                coin.width = chartCoinW;
                coin.height = chartCoinH;
                coin.pos = k.vec2(slot.x * scaleChartX, slot.y * scaleChartY);
            });

            footer.width = modalW;
            footer.height = footerH;
            footer.pos = k.vec2(0, modalH / 2 - footerH / 2);

            const buttonPadding = scaleX(k, 24);
            nextButton.width = modalW - buttonPadding * 2;
            nextButton.height = footerH - scaleY(k, 16);
        };

        layoutDialog();
        k.onResize(layoutDialog);
        startChartCoinReveal(k, modal, chartCoins, CHART_COIN_SPAWN_DELAY_SEC);
    };

    layoutCounter();
    k.onResize(layoutCounter);

    if (ALWAYS_SHOW_STICKER_CHART) {
        showWinModal(true);
    }

    return {
        onCoinCollected() {
            if (collected >= COINS_TO_WIN) return;

            collected++;
            updateCounter();

            if (collected >= COINS_TO_WIN) {
                showWinModal();
            }
        },
    };
}
