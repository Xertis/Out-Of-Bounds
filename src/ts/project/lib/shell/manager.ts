import { shell } from "client:api/v2/api";
import { contract } from "./contract";

export let shellInfo: Neutron.Shell.RegisteredShell | undefined;

export function init() {
    shellInfo = shell.register_as_shell(contract);

    shell.internal.add_trusted_pack("frontend")
    shell.internal.run(app);
}
