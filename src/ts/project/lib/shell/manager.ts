import { shell } from "client:api/v2/api";
import { contract } from "./contract";

export let shellInfo: Neutron.Shell.RegisteredShell | undefined;

export function init() {
    shellInfo = shell.register_as_shell(contract);

    shell.internal.add_trusted_pack("frontend")
    shell.internal.run(app);
}

export function leave() {
    /*     env.CLIENT_API.internal.connections.disconnect(env.SERVER, function()
        time.post_runnable(function()
            if world.is_open() then
                app.close_world()
            end
            app.reset_content()
            app.load_content()
        end)
    end) */
    shell.internal.connections.disconnect()
}
