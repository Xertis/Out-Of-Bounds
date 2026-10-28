import * as K from "kompot:kompot";

import { openWorld } from "../../lib/world_manager";
import { P, TuiButton, TuiPanel, tr } from "../../lib/themes/tui"
import { NewWorld } from "./_new_world";

const WorldList = K.component((props: { create: () => void }) => {
    const worlds = K.remember(() => world.get_list());
    const scroll = K.scroll_state();
    const [major, minor] = vc.get_version();

    K.Column({ modifier: K.M.fill_max_size(), spacing: 6 }, () => {
        TuiButton({ text: "+ " + tr("New World"), style: "title", on_click: props.create });
        K.Box({ modifier: K.M.fill_max_width().height(1).background(P.dim) });

        K.Column({ modifier: K.M.fill_max_width().weight(1).vertical_scroll(scroll), spacing: 2 }, () => {
            if (worlds.length === 0) K.Text("-", { color: P.dim });
            for (const info of worlds) {
                const newer = info.version[0] > major || (info.version[0] === major && info.version[1] > minor);
                K.key(info.name, () => {
                    TuiButton({
                        text: info.name,
                        trailing: `${info.version[0]}.${info.version[1]}`,
                        trailing_color: newer ? P.danger : P.mid,
                        on_click: () => openWorld(info.name),
                    });
                });
            }
        });

        TuiButton({ text: tr("Open worlds folder"), on_click: () => app.open_folder("user:worlds") });
    });
});

export const WorldsPanel = K.component(() => {
    const creating = K.state(false);
    TuiPanel({ title: tr(creating.value ? "New World" : "Worlds") }, () => {
        if (creating.value) NewWorld({ back: () => { creating.value = false; } });
        else WorldList({ create: () => { creating.value = true; } });
    });
});
