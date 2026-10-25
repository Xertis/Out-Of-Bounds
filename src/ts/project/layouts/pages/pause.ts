import { getServer } from "../../lib/shell/contract"
import { shell } from "client:api/v2/api"

interface UiCallbacks extends VC.LayoutCallbacks {
    leave(this: void): void
}

/*
function leave()
    env.CLIENT_API.internal.connections.disconnect(env.SERVER, function()
        time.post_runnable(function()
            if world.is_open() then
                app.close_world()
            end
            app.reset_content()
            app.load_content()
        end)
    end)
end*/

export function create(
    this: void,
    context: VC.LayoutContext
): UiCallbacks {
    return {
        on_open(this: void) {
        },
        leave(this: void) {
            const app = context.environment.app as typeof globalThis.app
            shell.internal.connections.disconnect(getServer(), () => {
                time.post_runnable(() => {
                    if (world.is_open()) {
                        app.close_world()
                    }
                    app.reset_content(["frontend", "client"])
                    app.config_packs(["frontend", "client"])
                    app.load_content()

                    menu.page = "main"
                })
            })
        }
    }
}
