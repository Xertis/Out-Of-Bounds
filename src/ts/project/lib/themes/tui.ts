// Тема и виджеты «TUI»: белый текст на чёрном, моноширинный шрифт, никаких скруглений.
// Из эффектов только редкий глитч фона и мигающий «>» у кнопок.
import * as K from "kompot:kompot";
import * as UI from "kompot:ui";

export const P = {
    bg: "#050505",
    panel: "#000000B8",
    dim: "#3C3C3C",
    mid: "#8A8A8A",
    text: "#DCDCDC",
    bright: "#FFFFFF",
    warn: "#FFC25A",
    danger: "#FF6252",
};

const TRANSPARENT = "#00000000";

// В паке frontend глобальный app есть не везде (в обычных модулях он nil), поэтому его берём
// из окружения лояута (context.environment.app) и кладём сюда в on_open.
export type App = typeof globalThis.app;
let current_app: App | undefined;
export function set_app(a: App): void { current_app = a; }
export function get_app(): App {
    if (current_app === undefined) throw new Error("app не задан: вызовите set_app(ctx.environment.app) в on_open");
    return current_app as App;
}

function read_look(): [number, number] {
    const m = input.get_mouse_pos();
    const v = gui.get_viewport();
    if (!m || !v) return [0, 0];
    const w = v[0], h = v[1];
    if (!w || !h) return [0, 0];
    const nx = Math.max(-1, Math.min(1, (m[0] / w) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, (m[1] / h) * 2 - 1));
    return [nx, ny];
}

/** Локализация: gui.str(ключ, контекст). */
export function tr(key: string, ctx?: string): string {
    return gui.str(key, ctx);
}

function mono(size: number): Partial<K.TextStyle> {
    return { font: `kompot_mono_${size}`, size };
}

export function tuiTheme(extra: K.ThemePatch<K.Theme> = {}): K.Theme {
    const flat = { color: false as const, border_width: 0, content_color: P.text };
    const base = UI.theme({
        dark: true,
        density: "compact",
        accent: P.text,
        colors: {
            background: P.bg,
            surface: P.bg,
            surface_raised: P.bg,
            on_surface: P.text,
            primary: P.text,
            on_primary: P.bg,
            outline: P.dim,
            muted: P.mid,
            dim: P.dim,
            bright: P.bright,
            error: P.danger,
            success: P.text,
            warning: P.warn,
            disabled_bg: P.bg,
            disabled_fg: P.dim,
            scrim: [0, 0, 0, 0.65],
        },
        type: {
            caption: mono(12),
            body: mono(16),
            label: mono(16),
            strong: mono(16),
            title: mono(20),
            heading: mono(24),
            display: mono(32),
            mono: mono(16),
        },
        metrics: { press_offset: 0 },
        surfaces: {
            default: { skin: false, border_width: 1, border_color: P.dim },
            panel: { color: P.bg, border_color: P.dim },
            card: { color: P.bg, border_color: P.dim },
            field: {
                color: P.bg,
                content_color: P.text,
                border_color: P.dim,
                states: {
                    hovered: { border_color: P.mid },
                    focused: { border_color: P.bright },
                    error: { border_color: P.danger },
                    disabled: { border_color: P.dim, content_color: P.dim },
                },
            },
            button: { ...flat, states: { hovered: { content_color: P.bright }, disabled: { content_color: P.dim } } },
            icon_button: flat,
            tool_button: flat,
            tab: flat,
            list_item: flat,
            menu: { color: P.bg, border_color: P.mid },
            menu_item: { ...flat, states: { hovered: { content_color: P.bright }, selected: { content_color: P.bright } } },
            tooltip: { color: P.bg, border_color: P.mid },
            toast: { color: P.bg, border_color: P.mid },
            slot: { color: P.bg, border_color: P.dim },
            badge: { color: P.text, content_color: P.bg, border_width: 0 },
            key: { color: false, border_color: P.mid, content_color: P.text },
            checkbox: { color: P.bg, border_color: P.mid, content_color: P.text },
            switch_track: { color: P.bg, border_color: P.mid },
            switch_thumb: { color: P.mid, border_width: 0, states: { selected: { color: P.text } } },
            slider_track: { color: P.dim, border_width: 0 },
            slider_fill: { color: P.text, border_width: 0 },
            slider_thumb: { color: P.bright, border_width: 0 },
            progress_track: { color: P.bg, border_color: P.dim },
            progress_fill: { color: P.text, border_width: 0 },
            scrollbar_thumb: { color: P.dim, border_width: 0, states: { hovered: { color: P.mid } } },
        },
        components: { Tabs: { indicator: false } },
    });
    return K.extend_theme(base as K.Theme, extra);
}


export interface ParallaxProps {
    strength?: number | undefined;
    depth?: number | undefined;
    smooth?: number | undefined;
    /** Базовый модификатор контейнера; по умолчанию fill_max_size. */
    modifier?: typeof K.M | undefined;
}
export const Parallax = K.component((props: ParallaxProps, content: K.Content) => {
    const strength = props.strength ?? 14;
    const depth = props.depth ?? 1;
    const smooth = props.smooth ?? 9;
    const pos = K.state({ x: 0, y: 0 });
    const cur = K.remember(() => ({ x: 0, y: 0 }));

    K.on_frame(dt => {
        const [nx, ny] = read_look();
        const k = 1 - Math.exp(-smooth * dt);   // экспоненциальное сглаживание, не зависит от FPS
        cur.x += (nx - cur.x) * k;
        cur.y += (ny - cur.y) * k;
        // не пересобираем дерево ради субпиксельных изменений
        if (Math.abs(cur.x - pos.peek().x) > 0.001 || Math.abs(cur.y - pos.peek().y) > 0.001) {
            pos.value = { x: cur.x, y: cur.y };
        }
    });

    const ox = -pos.value.x * strength * depth;
    const oy = -pos.value.y * strength * depth * 0.6; // по вертикали слабее, как у реальной головы

    const base = props.modifier ?? K.M.fill_max_size();
    K.Box({ modifier: base.offset(ox, oy) }, content);
});

// ───────────────────────── Кнопка ─────────────────────────

const ARROW_GAP = 22; // на сколько «выезжает» подпись вправо

// Подсвечивать кнопку по фокусу (клавиатура). Клик мышью оставляет фокус на кнопке,
// поэтому для мышиного меню false: активной считается только кнопка под курсором.
const KEYBOARD_FOCUS = false;

export interface TuiButtonProps {
    text: string;
    on_click?: (() => void) | undefined;
    /** Постоянно показывает «>» (выбранный пункт или вкладка). */
    selected?: boolean | undefined;
    danger?: boolean | undefined;
    enabled?: boolean | undefined;
    /** Фиксированная ширина; без неё кнопка занимает всю ширину. */
    width?: number | undefined;
    /** Имя стиля текста (по умолчанию body). */
    style?: string | undefined;
    /** Правый текст (например, версия мира). */
    trailing?: string | undefined;
    trailing_color?: string | undefined;
}

export const TuiButton = K.component((props: TuiButtonProps) => {
    const it = K.interaction();
    const enabled = props.enabled !== false;
    const blink = K.state(true);
    const st = K.remember(() => ({ acc: 0, mouse_focus: false }));
    const active = enabled && (it.hovered.value || (KEYBOARD_FOCUS && it.focused.value && !st.mouse_focus));

    K.on_frame(dt => {
        if (!it.focused.peek()) st.mouse_focus = false;
        if (!(it.hovered.peek() || (KEYBOARD_FOCUS && it.focused.peek() && !st.mouse_focus))) {
            st.acc = 0;
            if (!blink.peek()) blink.value = true;
            return;
        }
        st.acc += dt;
        if (st.acc >= 0.5) {
            st.acc -= 0.5;
            blink.value = !blink.peek();
        }
    });

    const shown = active || !!props.selected;
    const shift = K.animate(shown ? 1 : 0, K.tween(0.12));
    const arrow_visible = active ? blink.value : !!props.selected;

    let color = P.text;
    if (!enabled) color = P.dim;
    else if (props.danger) color = P.danger;
    else if (active || props.selected) color = P.bright;

    const on_click = props.on_click;
    const mod = (props.width ? K.M.width(props.width) : K.M.fill_max_width())
        .height(32)
        .clickable(
            () => { st.mouse_focus = true; on_click?.(); },
            { interaction: it, enabled, focus_color: TRANSPARENT, focusable: KEYBOARD_FOCUS },
        );
    const style = props.style ?? "body";

    K.Box({ modifier: mod, align: "center_start" }, () => {
        K.Text(">", { style, color: arrow_visible ? color : TRANSPARENT });
        K.Text(props.text, { style, color, modifier: K.M.offset(shift * ARROW_GAP, 0) });
        if (props.trailing) {
            K.Box({ modifier: K.M.fill_max_width(), align: "center_end" }, () => {
                K.Text(props.trailing, { style: "caption", color: props.trailing_color ?? P.mid });
            });
        }
    });
});

/** Флажок в виде «[x] Подпись». */
export const TuiToggle = K.component((props: { label: string; checked: boolean; on_change: (v: boolean) => void; enabled?: boolean | undefined }) => {
    const it = K.interaction();
    const enabled = props.enabled !== false;
    const hot = enabled && (it.hovered.value || it.focused.value);
    const color = !enabled ? P.dim : hot ? P.bright : P.text;
    K.Row({
        modifier: K.M.fill_max_width().height(28)
            .clickable(() => props.on_change(!props.checked), { interaction: it, enabled, focus_color: TRANSPARENT }),
        align: "center",
        spacing: 10,
    }, () => {
        K.Text(props.checked ? "[x]" : "[ ]", { color });
        K.Text(props.label, { color });
    });
});

// ───────────────────────── Панель и появление ─────────────────────────

/** Рамка с заголовком; содержимое занимает остаток высоты. */
export const TuiPanel = K.component((props: { title: string; width?: number | undefined }, content: K.Content) => {
    K.Column({
        modifier: K.M.width(props.width ?? 620).fill_max_height().background(P.panel).border(1, P.dim).padding(24),
        spacing: 14,
    }, () => {
        K.Text(props.title, { style: "title", color: P.bright });
        K.Box({ modifier: K.M.fill_max_width().height(1).background(P.dim) });
        K.Box({ modifier: K.M.fill_max_width().weight(1) }, content);
    });
});

/** Содержимое выезжает слева (из-под кнопок меню) и проявляется. */
export const SlideIn = K.component((_props: Record<string, never>, content: K.Content) => {
    const t = K.state(0);
    K.effect(() => { t.value = 1; });
    const p = K.animate(t.value, K.tween(0.18));
    K.Box({ modifier: K.M.fill_max_size().offset((p - 1) * 28, 0).alpha(p), align: "center_start" }, content);
});

// ───────────────────────── Глитч фона ─────────────────────────

/** Редкие короткие горизонтальные помехи. Ввод не перехватывает. */
export const Glitch = K.component(() => {
    const st = K.state({ on: false, seed: 0 });
    const t = K.remember(() => ({ next: 2 + Math.random() * 4, left: 0, tick: 0 }));

    K.on_frame(dt => {
        if (t.left > 0) {
            t.left -= dt;
            t.tick += dt;
            if (t.left <= 0) {
                st.value = { on: false, seed: 0 };
            } else if (t.tick >= 0.05) {
                t.tick = 0;
                st.value = { on: true, seed: Math.random() };
            }
        } else {
            t.next -= dt;
            if (t.next <= 0) {
                t.left = 0.1 + Math.random() * 0.15;
                t.next = 4 + Math.random() * 8;
                st.value = { on: true, seed: Math.random() };
            }
        }
    });

    if (!st.value.on) return;
    const seed = st.value.seed;
    K.Canvas({
        modifier: K.M.fill_max_size(),
        version: seed,
        draw: (cv, w, h) => {
            let s = Math.floor(seed * 1000000) + 1;
            const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
            const bands = 3 + Math.floor(rnd() * 3);
            for (let i = 0; i < bands; i++) {
                const y = Math.floor(rnd() * h);
                const bh = 2 + Math.floor(rnd() * 12);
                const x = Math.floor(rnd() * w * 0.4);
                cv.rect(x, y, w - x, bh, 255, 255, 255, 14);
                cv.rect(0, y + bh, w * (0.2 + rnd() * 0.5), 1, 255, 255, 255, 40);
            }
        },
    });
});
