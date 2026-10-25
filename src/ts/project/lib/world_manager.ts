import type { ServerConfig, WorldConfig, WorldRules } from "./types/server_config"
import { shell } from "client:api/v2/api"

export function createWorld(
    worldName: string,
    worldConfig: WorldConfig,
    contentPacks: string[]
) {
    const [major, minor] = vc.get_version()
    const configEngineVersion = `${major}.${minor}.0`

    const serverConfigFile = file.read("frontend:resources/server_config.json")
    let serverConfig = json.parse(serverConfigFile) as ServerConfig

    contentPacks.push("game")

    serverConfig.game.main_world = worldName
    serverConfig.game.worlds[worldName] = worldConfig
    serverConfig.game.content_packs = [...new Set(contentPacks)]

    serverConfig.server.version = configEngineVersion
}

export function openWorld(
    worldName: string
) {
    shell.internal.connections.run_single(worldName, 0, "player", "player", (server) => {
        debug.print("вроде подключились")
    })
}
