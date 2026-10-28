import * as K from "kompot:kompot";
import * as UI from "kompot:ui";

import { createWorld } from "../../lib/world_manager";
import { P, TuiButton, tr } from "../../lib/themes/tui";

const ALLOWED =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    + "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
    + "0123456789-. ";

function validName(name: string): boolean {
    if (name.length === 0) return false;
    for (let i = 0; i < name.length; i++) {
        if (!ALLOWED.includes(name.charAt(i))) return false;
    }
    return !world.exists(name);
}

function namePlaceholder(): string {
    const part = "New World";
    let name = part;
    let num = 0;
    while (world.exists(name)) {
        num += 1;
        name = `${part} ${num}`;
    }
    return name;
}

export const NewWorld = K.component((props: { back: () => void }) => {
    const name = K.state("");
    const seed = K.state("");
    const ph = K.remember(() => ({ name: namePlaceholder(), seed: Math.random().toString().slice(2) }));

    const final_name = name.value === "" ? ph.name : name.value;
    const valid = validName(final_name);

    K.Column({ modifier: K.M.fill_max_size(), spacing: 8 }, () => {
        K.Text(tr("Name"), { color: P.mid });
        UI.Field({ state: name, hint: ph.name, error: name.value !== "" && !valid, modifier: K.M.fill_max_width() });
        K.Spacer(1, 6);
        K.Text(tr("Seed"), { color: P.mid });
        UI.Field({ state: seed, hint: ph.seed, modifier: K.M.fill_max_width() });
        K.Spacer(1, 14);
        TuiButton({
            text: tr("Create World"),
            style: "title",
            enabled: valid,
            on_click: () => {
                createWorld(
                    final_name,
                    {
                        seed: seed.value === "" ? ph.seed : seed.value,
                        generator: "core:default",
                        rules: { "cheat-commands": true },
                    },
                    [],
                );
            },
        });
        TuiButton({ text: tr("Back"), on_click: props.back });
    });
});
