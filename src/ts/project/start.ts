export function run(this: void, application: typeof app): void {
    application.tick();
    application.config_packs(["frontend"]);
    application.load_content();
}
