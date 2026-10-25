import { shell } from "client:api/v2/api"

const serverConfigFile = file.read("frontend:resources/server_config.json")

export type ServerConfig = Neutron.Shell.ServerConfig;
export type WorldConfig = Neutron.Shell.WorldConfig;
export type GameConfig = Neutron.Shell.GameConfig;
export type RoleConfig = Neutron.Shell.RoleConfig;

function makeConfig(
    worldName: string,
    worldConfig?: WorldConfig,
    contentPacks?: string[]
): ServerConfig {
    const [major, minor] = vc.get_version()
    const configEngineVersion = `${major}.${minor}.0`

    let serverConfig = json.parse(serverConfigFile) as ServerConfig

    if (worldConfig) serverConfig.game.worlds[worldName] = worldConfig
    else serverConfig.game.worlds[worldName] = serverConfig.game.worlds["default"]!

    optional(contentPacks, (p) => {
        p.push("game")
        p.push("base")
        serverConfig.game.content_packs = [...new Set(contentPacks)]
    })

    serverConfig.game.main_world = worldName
    serverConfig.server.version = configEngineVersion

    return serverConfig
}

export function createWorld(
    worldName: string,
    worldConfig: WorldConfig,
    contentPacks: string[]
) {
    const serverConfig = makeConfig(worldName, worldConfig, contentPacks)

    shell.internal.connections.run_single(serverConfig, 0, "player", "player", (server) => {
        debug.print("вроде подключились")
    })
}

export function openWorld(
    worldName: string
) {
    const serverConfig = makeConfig(worldName)

    shell.internal.connections.run_single(serverConfig, 0, "player", "player", (server) => {
        debug.print("вроде подключились")
    })
}
