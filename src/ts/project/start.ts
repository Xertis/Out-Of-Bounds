const manager = lazy(import("./lib/shell/manager"));

export function run(): void {
    app.tick()
    app.config_packs(["frontend", "client"])
    app.load_content()

    manager.init()
}
