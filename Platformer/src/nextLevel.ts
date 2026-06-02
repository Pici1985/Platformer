import type { KAPLAYCtx } from "kaplay";
import { scaleY } from "./layout";

export function setupNextLevelScene(k: KAPLAYCtx) {
    k.add([
        k.text("Next level — coming soon", {
            size: scaleY(k, 48),
            align: "center",
        }),
        k.pos(k.center()),
        k.anchor("center"),
        k.fixed(),
    ]);
}
