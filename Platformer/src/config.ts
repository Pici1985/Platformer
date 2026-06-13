export type DifficultyId = "easy" | "medium" | "hard";

export type DifficultyOption = {
    id: DifficultyId;
    label: string;
    color: readonly [number, number, number];
};

export const DIFFICULTY_OPTIONS: readonly DifficultyOption[] = [
    { id: "easy", label: "Easy", color: [76, 175, 80] },
    { id: "medium", label: "Medium", color: [255, 152, 0] },
    { id: "hard", label: "Hard", color: [244, 67, 54] },
];

/** When true, show the selected difficulty label at the top of the screen during play. */
export const SHOW_DIFFICULTY_INDICATOR = true;

/** Coins the player must collect before the win modal appears. */
export const COINS_TO_WIN = 20;

/** Keep the sticker chart on screen during play (layout tuning). Set to false when done. */
export const ALWAYS_SHOW_STICKER_CHART = false;

/** Seconds between each sticker-chart coin appearing (first coin is immediate). */
export const CHART_COIN_SPAWN_DELAY_SEC = 1;

/** When true, reaching the coin goal skips the win modal and goes straight to level 1. */
export const SKIP_STICKER_CHART = false;
