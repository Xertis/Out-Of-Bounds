export function run(application: typeof app): void {
    application.tick();
    application.config_packs(["frontend"]);
    application.load_content();

    menu.page = "main"
}
