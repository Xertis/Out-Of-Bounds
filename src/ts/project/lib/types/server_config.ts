export interface WorldRules {
  "cheat-commands": boolean;
}

export interface WorldConfig {
  seed: string;
  generator: string;
  rules: WorldRules;
}

export interface GameConfig {
  content_packs: string[];
  plugins: string[];
  worlds: Record<string, WorldConfig>;
  main_world: string;
}

export interface ServerSettings {
  version: string;
  max_players: number;
  short_description: string;
  description: string;
  port: number;
  http_enabled: boolean;
  auto_save_interval: number;
  chunks_loading_distance: number;
  chunks_loading_speed: number;
  password_auth: boolean;
  last_session_lifetime: number;
  dev_mode: boolean;
  shallow_dev_mode: boolean;
  shutdown_timeout: number;
  kick_threshold_timeout: number;
  whitelist: string[];
  whitelist_ip: string[];
  blacklist: string[];
}

export interface RoleRules {
  "allow-content-access": boolean;
  "allow-flight": boolean;
  "allow-noclip": boolean;
  "allow-attack": boolean;
  "allow-destroy": boolean;
  "allow-cheat-movement": boolean;
  "allow-debug-cheats": boolean;
  "allow-fast-interaction": boolean;
}

export interface RolePermissions {
  role_management: boolean;
  time_management: boolean;
}

export interface RoleConfig {
  priority: number;
  rules: RoleRules;
  permissions: RolePermissions;
}

export interface RolesConfig {
  default_role: string;
  member: RoleConfig;
}

export interface ServerConfig {
  game: GameConfig;
  server: ServerSettings;
  roles: RolesConfig;
}
