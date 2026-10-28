import * as K from "kompot:kompot";

import { P, TuiButton, tr, tuiTheme, get_app, set_app } from "../../lib/themes/tui";
import { getServer } from "../../lib/shell/contract";
import { shell } from "client:api/v2/api";

export function create(this: void, ctx: VC.LayoutContext): VC.LayoutCallbacks {
    let handle: K.MountHandle | undefined;

    const leave = (): void => {
        const app = ctx.environment.app as typeof globalThis.app;
        shell.internal.connections.disconnect(getServer(), () => {
            time.post_runnable(() => {
                if (world.is_open()) {
                    app.close_world();
                }
                app.reset_content(["frontend", "client"]);
                app.config_packs(["frontend", "client"]);
                app.load_content();

                menu.page = "main";
            });
        });
    };

    const Screen = K.component(() => {
        K.Box({ modifier: K.M.fill_max_size().background([0, 0, 0, 0.6]) }, () => {
            K.Column({ modifier: K.M.width(360).fill_max_height().padding({ l: 64 }), arrangement: "center", spacing: 4 }, () => {
                K.Text(tr("Pause", "menu"), { style: "caption", color: P.mid });
                K.Spacer(1, 18);
                TuiButton({ text: tr("Continue"), style: "title", on_click: () => gui.close_menu() });
                TuiButton({ text: tr("Save and Quit to Menu"), style: "title", on_click: leave });
            });
        });
    });

    return {
        on_open(this: void): void {
            set_app(ctx.environment.app as typeof globalThis.app);
            handle = K.mount({
                target: ctx.document.root,
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
