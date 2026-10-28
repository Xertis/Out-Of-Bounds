import * as K from "kompot:kompot";
import * as UI from "kompot:ui";

import { P, TuiButton, TuiPanel, TuiToggle, tr, get_app } from "../../lib/themes/tui";

const num = (id: string): number => get_app().get_setting(id) as number;
const flag = (id: string): boolean => get_app().get_setting(id) as boolean;
const text = (id: string): string => get_app().get_setting(id) as string;

const input_devices = (audio as unknown as { __get_input_devices_names(this: void): string[] }).__get_input_devices_names;

type Section = "audio" | "display" | "graphics" | "controls" | "reset";

const S = (key: string) => tr(key, "settings");

function decimals(step: number): number {
    return step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
}

const Slider = K.component((p: { id: string; name: string; step: number; post?: string; fps?: boolean; on_release?: boolean }) => {
    const info = get_app().get_setting_info(p.id);
    const v = K.state<number>(num(p.id));
    const fmt = (x: number): string => {
        if (p.fps && x === -1) return tr("V-Sync");
        if (p.fps && x === 0) return tr("Unlimited");
        return x.toFixed(decimals(p.step)) + (p.post ?? "");
    };
    UI.Slider({
        label: S(p.name),
        value: v.value,
        ...(info.min !== undefined ? { min: info.min } : {}),
        ...(info.max !== undefined ? { max: info.max } : {}),
        step: p.step,
        format: fmt,
        modifier: K.M.fill_max_width(),
        on_change: x => {
            v.value = x;
            if (!p.on_release) get_app().set_setting(p.id, x);
        },
        on_change_end: () => {
            if (p.on_release) get_app().set_setting(p.id, v.peek());
        },
    });
});

const Check = K.component((p: { id: string; name: string; on_change?: (v: boolean) => void }) => {
    const v = K.state<boolean>(flag(p.id));
    TuiToggle({
        label: S(p.name),
        checked: v.value,
        on_change: x => {
            v.value = x;
            get_app().set_setting(p.id, x);
            p.on_change?.(x);
        },
    });
});

const Label = (text: string) => K.Text(text, { color: P.mid });

const Audio = K.component(() => {
    const rec = K.state<boolean>(flag("audio.recording-enabled"));
    const device = K.state<string>(text("audio.input-device"));
    const level = K.state(0);
    const token = K.remember(() => core.get_core_token());
    const peak = K.remember(() => ({ v: 0 }));
    const devices = K.remember(() => input_devices().map(n => ({ value: n, text: n })));

    K.on_frame(dt => {
        if (!flag("audio.recording-enabled") || token === undefined) return;
        audio.input.fetch(token);
        let amp = audio.input.get_max_amplitude();
        if (amp > 0) amp = Math.sqrt(amp);
        peak.v = Math.max(amp, peak.v - dt);
        const q = Math.floor(peak.v * 40) / 40;
        if (q !== level.peek()) level.value = q;
    });

    Slider({ id: "audio.volume-master", name: "Master Volume", step: 0.01 });
    Slider({ id: "audio.volume-regular", name: "Regular Sounds", step: 0.01 });
    Slider({ id: "audio.volume-ui", name: "UI Sounds", step: 0.01 });
    Slider({ id: "audio.volume-ambient", name: "Ambient", step: 0.01 });
    Slider({ id: "audio.volume-music", name: "Music", step: 0.01 });

    K.Spacer(1, 8);
    Label(S("Microphone"));
    Check({ id: "audio.recording-enabled", name: "Microphone access", on_change: v => { rec.value = v; } });
    if (rec.value) {
        UI.Select<string>({
            options: devices,
            selected: device.value,
            modifier: K.M.fill_max_width(),
            on_select: v => { device.value = v; get_app().set_setting("audio.input-device", v); },
        });
        K.Box({ modifier: K.M.fill_max_width().height(6).background(P.dim) }, () => {
            K.Box({ modifier: K.M.fill_max_width(Math.min(1, level.value)).height(6).background(P.bright) });
        });
    }
    Check({ id: "audio.acoustic-effects", name: "Acoustic effects" });
});

const Display = K.component(() => {
    const locales = K.remember(() => {
        const out: { value: string; text: string }[] = [];
        const info = gui.get_locales_info();
        for (const [id, loc] of Object.entries(info)) out.push({ value: id, text: loc.name });
        return out;
    });
    const lang = K.state<string>(text("ui.language"));
    const mode = K.state<number>(num("display.window-mode"));

    Slider({ id: "camera.fov", name: "FOV", step: 1, post: "°" });
    Slider({ id: "display.framerate", name: "Framerate", step: 1, fps: true, on_release: true });
    Slider({ id: "graphics.gamma", name: "Gamma", step: 0.05 });
    K.Spacer(1, 6);
    UI.Select<number>({
        options: [[0, tr("Windowed", "settings")], [1, tr("Fullscreen", "settings")], [2, tr("Borderless", "settings")]],
        selected: mode.value,
        modifier: K.M.fill_max_width(),
        on_select: v => { mode.value = v; get_app().set_setting("display.window-mode", v); },
    });
    Check({ id: "camera.shaking", name: "Camera Shaking" });
    Check({ id: "camera.inertia", name: "Camera Inertia" });
    Check({ id: "camera.fov-effects", name: "Camera FOV Effects" });
    Check({ id: "display.limit-fps-iconified", name: "Limit Background FPS" });
    K.Spacer(1, 6);
    Label(S("Language"));
    UI.Select<string>({
        options: locales,
        selected: lang.value,
        modifier: K.M.fill_max_width(),
        on_select: v => { lang.value = v; get_app().set_setting("ui.language", v); },
    });
});

const Graphics = K.component(() => {
    Slider({ id: "chunks.load-distance", name: "Load Distance", step: 1 });
    Slider({ id: "chunks.load-speed", name: "Load Speed", step: 1 });
    Slider({ id: "graphics.fog-curve", name: "Fog Curve", step: 0.1 });
    Slider({ id: "graphics.ssao", name: "SSAO", step: 1 });
    Slider({ id: "graphics.shadows-quality", name: "Shadows quality", step: 1 });
    Slider({ id: "graphics.clouds-quality", name: "Clouds quality", step: 1 });
    K.Spacer(1, 6);
    Check({ id: "graphics.enable-fog", name: "Fog" });
    Check({ id: "graphics.backlight", name: "Backlight" });
    Check({ id: "graphics.soft-lighting", name: "Soft lighting" });
    Check({ id: "graphics.dense-render", name: "Dense blocks render" });
    Check({ id: "graphics.advanced-render", name: "Advanced render" });
});

const Controls = K.component(() => {
    const search = K.state("");
    const by_key = K.state(false);
    const names = K.remember(() => {
        const list = input.get_bindings() ?? [];
        list.sort((a, b) => (a > b ? -1 : 1));
        return list;
    });

    Slider({ id: "camera.sensitivity", name: "Mouse Sensitivity", step: 0.05 });
    K.Spacer(1, 6);
    UI.Field({ state: search, hint: tr("Search", "settings"), modifier: K.M.fill_max_width() });
    TuiToggle({ label: S("Search by key"), checked: by_key.value, on_change: v => { by_key.value = v; } });
    K.Spacer(1, 6);

    const keys: Record<string, number> = {};
    for (const n of names) {
        const k = input.get_binding_text(n) ?? "";
        keys[k] = (keys[k] ?? 0) + 1;
    }
    const q = search.value.toLowerCase();
    for (const n of names) {
        const label = tr(n);
        const key = input.get_binding_text(n) ?? "";
        const hay = (by_key.value ? key : label).toLowerCase();
        if (q !== "" && !hay.includes(q)) continue;
        K.key(n, () => {
            K.Row({ modifier: K.M.fill_max_width().height(24), align: "center" }, () => {
                K.Box({ modifier: K.M.weight(1) }, () => K.Text(label));
                K.Text(key, { color: (keys[key] ?? 0) > 1 ? P.warn : P.mid });
            });
        });
    }
});

const Reset = K.component(() => {
    const done = K.state("");
    const reset = (names: string[], tag: string) => {
        for (const n of names) get_app().set_setting(n, get_app().get_setting_info(n).def);
        done.value = tag;
    };
    const row = (tag: string, title: string, names: string[]) => TuiButton({
        text: tr(title, "menu"),
        trailing: done.value === tag ? "OK" : undefined,
        trailing_color: P.bright,
        on_click: () => reset(names, tag),
    });
    row("aud", "Audio", ["audio.volume-master", "audio.volume-regular", "audio.volume-ui", "audio.volume-ambient", "audio.volume-music"]);
    row("dsp", "Display", ["camera.fov", "display.framerate", "display.fullscreen", "camera.shaking", "camera.inertia", "camera.fov-effects"]);
    row("gfx", "Graphics", ["chunks.load-distance", "chunks.load-speed", "graphics.fog-curve", "graphics.gamma", "graphics.backlight"]);
    TuiButton({
        text: tr("Controls", "menu"),
        trailing: done.value === "ctl" ? "OK" : undefined,
        trailing_color: P.bright,
        on_click: () => { input.reset_bindings(); done.value = "ctl"; },
    });
});

const TABS: [Section, string][] = [
    ["audio", "Audio"],
    ["display", "Display"],
    ["graphics", "Graphics"],
    ["controls", "Controls"],
    ["reset", "Reset settings"],
];

const SectionBody = K.component((props: { section: Section }) => {
    const section = props.section;
    const scroll = K.scroll_state();
    K.Column({ modifier: K.M.fill_max_size().vertical_scroll(scroll), spacing: 8 }, () => {
        if (section === "audio") Audio();
        else if (section === "display") Display();
        else if (section === "graphics") Graphics();
        else if (section === "controls") Controls();
        else Reset();
    });
});

export const SettingsPanel = K.component(() => {
    const tab = K.state<Section>("audio");
    TuiPanel({ title: tr("Settings"), width: 680 }, () => {
        K.Column({ modifier: K.M.fill_max_size(), spacing: 10 }, () => {
            K.Row({ modifier: K.M.fill_max_width(), spacing: 4 }, () => {
                for (const [id, title] of TABS) {
                    TuiButton({ text: tr(title, "menu"), width: 126, selected: tab.value === id, on_click: () => { tab.value = id; } });
                }
            });
            K.Box({ modifier: K.M.fill_max_width().height(1).background(P.dim) });
            K.Box({ modifier: K.M.fill_max_width().weight(1) }, () => {
                K.key(tab.value, () => SectionBody({ section: tab.value }));
            });
            TuiButton({ text: tr("Open data folder", "menu"), width: 280, on_click: () => get_app().open_folder("user:") });
        });
    });
});
