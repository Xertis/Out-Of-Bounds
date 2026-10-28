import * as K from "kompot:kompot";

import { Glitch, Parallax, P, SlideIn, TuiButton, tr, tuiTheme, get_app, set_app, type App } from "../../lib/themes/tui";
import { WorldsPanel } from "./_worlds";
import { SettingsPanel } from "./_settings";

type Page = "none" | "worlds" | "settings";


const Screen = K.component(() => {
    const page = K.state<Page>("none");
    const toggle = (p: Page) => () => { page.value = page.peek() === p ? "none" : p; };

    K.Box({ modifier: K.M.fill_max_size().background(P.bg) }, () => {
        K.Box({ modifier: K.M.fill_max_size(), align: "center" }, () => {
            K.Image("misc/planet_transparent", { width: 512, height: 512 });
        });
        K.Row({ modifier: K.M.fill_max_size().padding({ l: 64, t: 48, r: 48, b: 48 }), spacing: 56 }, () => {
            Parallax({ depth: 1, modifier: K.M.width(260).fill_max_height() }, () => {
                K.Column({ modifier: K.M.fill_max_size(), arrangement: "center", spacing: 4 }, () => {
                    TuiButton({ text: tr("Worlds"), style: "title", selected: page.value === "worlds", on_click: toggle("worlds") });
                    TuiButton({ text: tr("Settings"), style: "title", selected: page.value === "settings", on_click: toggle("settings") });
                    TuiButton({ text: tr("Quit"), style: "title", danger: true, on_click: () => { get_app().quit(true); } });
                });
            });
            Parallax({ depth: 1.5, modifier: K.M.weight(1).fill_max_height() }, () => {
                K.Box({ modifier: K.M.fill_max_size(), align: "center_start" }, () => {
                    if (page.value !== "none") {
                        K.key(page.value, () => SlideIn({}, () => {
                            if (page.value === "worlds") WorldsPanel();
                            else SettingsPanel();
                        }));
                    }
                });
            });
        });

        Parallax({ depth: 0.3 }, () => Glitch());
    });
});

export function create(this: void, ctx: VC.LayoutContext): VC.LayoutCallbacks {
    let handle: K.MountHandle | undefined;
    return {
        on_open(this: void): void {
            set_app(ctx.environment.app as App);
            handle = K.mount({
                theme: tuiTheme(),
                content: Screen,
                keyboard_navigation: true,
            });
        },
        on_close(this: void): void {
            handle?.dispose();
            handle = undefined;
        },
    };
}
