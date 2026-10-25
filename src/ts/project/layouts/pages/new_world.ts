import { createWorld } from "../../lib/world_manager";
let settings = session.get("new_world")

interface UiCallbacks extends VC.LayoutCallbacks {
    create_world(this: void): void
    save_state(this: void): void
    world_name_validator(this: void, name: string): boolean
}

function worldNamePlaceholder(): string {
    const part = "New World"
    let name = part
    let num = 0

    while (world.exists(name)) {
        num += 1
        name = `${part} ${num}`
    }
    return name
}

export function create(
    this: void,
    context: VC.LayoutContext
): UiCallbacks {
    return {
        on_open(this: void) {
            const doc = context.document

            optional(doc.name_box, (box) => {
                box.text = settings.name as string ?? ""
                box.placeholder = worldNamePlaceholder()
            })
            optional(doc.seed_box, (box) => {
                box.text = settings.seed as string ?? ""
                box.placeholder = Math.random().toString().slice(2)
            })
        },
        save_state() {
            const doc = context.document

            settings.name = doc.name_box!.text
            settings.seed = doc.seed_box!.text
        },
        world_name_validator(this: void, name: string): boolean {
            const allowed =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    + "абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
                    + "0123456789-. "
            if (name.length == 0) return false
            for (let i = 0; i < name.length; i++) {
                if (!allowed.includes(name.charAt(i))) return false
            }
            return !world.exists(name)
        },
        create_world(this: void) {
            const doc = context.document
            if (!doc.name_box?.valid) return

            const name = doc.name_box!.text
            const seed = doc.seed_box!.text

            if (name == null || seed == null) return;
            session.reset("new_world")

            createWorld(
                name,
                {
                    seed: seed,
                    generator: "core:default",
                    rules: {
                        "cheat-commands": true
                    }
                },
                []
            )
        },
    }
}
