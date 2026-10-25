import { openWorld } from "../../lib/world_manager";
import { WorldConfig } from "../../lib/types/server_config";

interface WorldsCallbacks extends VC.LayoutCallbacks {
    open_world(this: void, name: string): void
}

export function create(
    this: void,
    context: VC.LayoutContext
): WorldsCallbacks {
    return {
        on_open(this: void): void {
            const worlds = world.get_list()

            for (const info of worlds) {
                const [major, minor] = vc.get_version()
                const worldInfo = {
                    ...info,
                    versionColor: info.version[0] > major || info.version[1] > minor ? "#A02010" : "#808080",
                    versionString: `${info.version[0]}.${info.version[1]}`,
                }

                context.document.worlds?.add?.(
                    gui.template("world", worldInfo)
                )
            }
        },
        open_world(this: void, name: string): void {
            openWorld(name)
        },
    }
}
