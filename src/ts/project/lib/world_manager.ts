import type { ServerConfig, WorldConfig, WorldRules } from "./types/server_config"

export function create_world(
    worldName: string,
    worldConfig: WorldConfig,
    contentPacks: string[]
) {
    const [major, minor] = vc.get_version()
    const configEngineVersion = `${major}.${minor}.0`

    const serverConfigFile = file.read("frontend:resources/server_config.json")
    let serverConfig = json.parse(serverConfigFile) as ServerConfig

    serverConfig.game.main_world = worldName
    serverConfig.game.worlds[worldName] = worldConfig
    serverConfig.game.content_packs = contentPacks

    serverConfig.server.version = configEngineVersion
}
