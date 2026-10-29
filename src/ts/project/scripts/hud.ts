export function create(this: void, ctx: VC.ScriptContext): VC.HudCallbacks {
    return {
        on_hud_open(this: void): void {
            debug.print(2323);

            const planetSlot = gfx.posteffects.index("core:planet_shader");

            gfx.posteffects.set_effect(planetSlot, "planet_shader")
            gfx.posteffects.set_params(planetSlot, {
                uTime: 0,
                uSpin: 0,
                uScope: 0
            });
            gfx.posteffects.set_intensity(planetSlot, 1.0);
        }
    };
}
