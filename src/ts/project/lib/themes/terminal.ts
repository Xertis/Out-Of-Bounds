// Тема «старый ЭЛТ-терминал» для Kompot UI: люминофор на тёмном фоне, моноширинный шрифт,
// прямые углы, тонкие рамки, инверсия при наведении, развёртка и лёгкое мерцание.
import * as K from "kompot:kompot";
import * as UI from "kompot:ui";

export type TerminalVariant = "green" | "amber";

interface Palette {
    bg: string;     // фон экрана
    panel: string;  // фон панелей
    dim: string;    // еле заметные линии, отключённое
    mid: string;    // рамки и второстепенный текст
    text: string;   // основной цвет люминофора
    bright: string; // яркие акценты, нажатие
    warn: string;
    danger: string;
}

const PALETTES: Record<TerminalVariant, Palette> = {
    green: { bg: "#030A05", panel: "#06120A", dim: "#16422A", mid: "#2F9B5E", text: "#7CF2A8", bright: "#D8FFE6", warn: "#FFC25A", danger: "#FF6252" },
    amber: { bg: "#0A0602", panel: "#130B03", dim: "#4A2F10", mid: "#B0701F", text: "#FFB347", bright: "#FFE6B8", warn: "#FFD97A", danger: "#FF6252" },
};

const TRANSPARENT = "#00000000";

function mono(size: number): Partial<K.TextStyle> {
    return { font: `kompot_mono_${size}`, size };
}

type TerminalTheme = K.Theme;

// extra - свои правки поверх темы (глубокое слияние K.extend_theme: можно менять отдельные поверхности и цвета).
export function terminalTheme(variant: TerminalVariant = "green", extra: K.ThemePatch<TerminalTheme> = {}): TerminalTheme {
    const p = PALETTES[variant];
    // Инверсия: светлый блок и тёмный текст, как выделение в терминале.
    const inverted = { color: p.text, content_color: p.bg, border_color: p.text };

    const base = UI.theme({
        dark: true,
        density: "compact",
        accent: p.text,
        colors: {
            background: p.bg,
            surface: p.panel,
            surface_raised: p.panel,
            on_surface: p.text,
            primary: p.text,
            on_primary: p.bg,
            outline: p.mid,
            muted: p.mid,
            dim: p.dim,
            bright: p.bright,
            header: p.text,
            status: p.mid,
            brand: p.text,
            key: p.text,
            edge: p.mid,
            shadow: p.bg,
            slot_edge: p.mid,
            error: p.danger,
            success: p.text,
            warning: p.warn,
            disabled_bg: p.bg,
            disabled_fg: p.dim,
            scrim: [0, 0, 0, 0.65],
        },
        // Все стили текста: моноширинный IBM Plex Mono из Kompot (есть кириллица и рамочные символы).
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
            // Плоские поверхности без текстур с тонкой рамкой.
            default: { skin: false, border_width: 1, border_color: p.mid },
            panel: { color: p.panel, border_color: p.mid },
            card: { color: p.bg, border_color: p.dim },
            field: {
                color: p.bg,
                content_color: p.text,
                states: {
                    focused: { border_color: p.bright },
                    error: { border_color: p.danger },
                    disabled: { border_color: p.dim, content_color: p.dim },
                },
            },
            button: {
                color: false,
                content_color: p.text,
                focus_color: p.bright,
                states: {
                    hovered: inverted,
                    focused: { border_color: p.bright },
                    pressed: { color: p.bright, content_color: p.bg, border_color: p.bright },
                    selected: inverted,
                    disabled: { color: false, content_color: p.dim, border_color: p.dim },
                },
                variants: {
                    primary: { border_color: p.bright, content_color: p.bright },
                    ghost: { border_width: 0 },
                    danger: {
                        border_color: p.danger,
                        content_color: p.danger,
                        states: { hovered: { color: p.danger, content_color: p.bg, border_color: p.danger } },
                    },
                },
            },
            icon_button: { color: false, content_color: p.text, states: { hovered: inverted, selected: inverted } },
            tool_button: { color: false, content_color: p.text, states: { hovered: inverted, selected: inverted } },
            tab: { color: false, content_color: p.mid, border_width: 0, states: { hovered: { content_color: p.text }, selected: { content_color: p.bright } } },
            list_item: { color: false, border_width: 0, content_color: p.text, states: { hovered: inverted, selected: inverted } },
            menu: { color: p.panel, border_color: p.mid },
            menu_item: { color: false, border_width: 0, content_color: p.text, states: { hovered: inverted, selected: inverted } },
            tooltip: { color: p.bg, border_color: p.mid },
            toast: { color: p.bg, border_color: p.mid },
            slot: { color: p.bg, border_color: p.dim, states: { hovered: { border_color: p.text }, selected: { border_color: p.bright } } },
            badge: { color: p.text, content_color: p.bg, border_width: 0 },
            key: { color: false, border_color: p.mid, content_color: p.text },
            checkbox: { color: p.bg, border_color: p.mid, content_color: p.text, states: { selected: { color: p.text, content_color: p.bg } } },
            switch_track: { color: p.bg, border_color: p.mid, states: { selected: { color: p.dim } } },
            switch_thumb: { color: p.mid, border_width: 0, states: { selected: { color: p.text } } },
            slider_track: { color: p.dim, border_width: 0 },
            slider_fill: { color: p.text, border_width: 0 },
            slider_thumb: { color: p.bright, border_width: 0 },
            progress_track: { color: p.bg, border_color: p.mid },
            progress_fill: { color: p.text, border_width: 0 },
            scrollbar_thumb: { color: p.mid, border_width: 0, states: { hovered: { color: p.text } } },
        },
        components: { Tabs: { indicator: false } },
    });
    return K.extend_theme(base, extra);
}

// Горизонтальные линии развёртки: рисуются один раз на размер экрана.
// Компонент всегда получает таблицу свойств первым аргументом: Scanlines({ alpha }), а не Scanlines(alpha).
const Scanlines = K.component((props: { alpha: number }) => {
    const alpha = props.alpha;
    const rt = K.runtime();
    K.Canvas({
        modifier: K.M.fill_max_size(),
        version: `${rt.width}x${rt.height}:${alpha}`,
        draw: (cv, w, h) => {
            for (let y = 0; y < h; y += 3) cv.rect(0, y, w, 1, 0, 0, 0, alpha);
        },
    });
});

// Дрожание яркости и медленно ползущая светлая полоса, как обновление кадра на старом мониторе.
const Flicker = K.component(() => {
    const dim = K.state(0);
    const roll = K.state(0);
    const timer = K.remember(() => ({ acc: 0 }));
    K.on_frame(dt => {
        roll.value = (roll.peek() + dt * 0.12) % 1;
        timer.acc += dt;
        if (timer.acc >= 0.06) {
            timer.acc = 0;
            dim.value = Math.random() * 0.05;
        }
    });

    const rt = K.runtime();
    const base = K.theme().colors["primary"] ?? K.color.WHITE;
    K.Box({ modifier: K.M.fill_max_size() }, () => {
        K.Box({ modifier: K.M.fill_max_size().background([0, 0, 0, dim.value]) });
        K.Box({
            modifier: K.M.fill_max_width().height(56)
                .offset(0, roll.value * (rt.height + 112) - 56)
                .background(K.color.with_alpha(base, 0.035)),
        });
    });
});

export interface CrtOptions {
    /** Линии развёртки (0..255, прозрачность чёрных линий). false - выключить. */
    scanlines?: number | false;
    flicker?: boolean;
    /** Выравнивание содержимого на экране. */
    align?: K.Align;
}

// Корень экрана: сплошной фон, содержимое и эффекты ЭЛТ поверх. Эффекты не перехватывают ввод.
export function Crt(this: void, content: K.Content, opts: CrtOptions = {}): void {
    const bg = K.theme().colors["background"] ?? K.color.BLACK;
    const scan = opts.scanlines === undefined ? 70 : opts.scanlines;
    K.Box({ modifier: K.M.fill_max_size().background(bg) }, () => {
        K.Box({ modifier: K.M.fill_max_size(), align: opts.align ?? "center" }, content);
        if (scan !== false) Scanlines({ alpha: scan });
        if (opts.flicker !== false) Flicker();
    });
}

// Мигающий блок-курсор: «> команда█».
export const Cursor = K.component(() => {
    const visible = K.state(true);
    const timer = K.remember(() => ({ acc: 0 }));
    K.on_frame(dt => {
        timer.acc += dt;
        if (timer.acc >= 0.5) {
            timer.acc -= 0.5;
            visible.value = !visible.peek();
        }
    });
    K.Text("█", visible.value ? {} : { color: TRANSPARENT });
});
