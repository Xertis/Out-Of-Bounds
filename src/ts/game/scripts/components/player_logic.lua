local tsf = entity.transform
local body = entity.rigidbody

states = {}
attributes = {}

local player_states = ARGS.states or {
    hp = DEFAULT_MAX_PLAYER_HP,
    connection_level = 100
}

local player_attributes = ARGS.attributes or {
    max_hp = DEFAULT_MAX_PLAYER_HP
}

if SAVED_DATA.states then
    player_states = SAVED_DATA.states
    player_attributes = SAVED_DATA.attributes
end

function on_save()
    SAVED_DATA.states = player_states
    SAVED_DATA.attributes = player_attributes
end

function states.get_hp()
    return player_states.hp
end

function states.get_connection()
    return player_states.connection_level
end

function attributes.get_max_hp()
    return player_attributes.max_hp
end

function attributes.get_max_connection()
    return player_attributes.max_connection
end

function on_custom_field_update(key, value)
    player_states[key] = value

    print(key, value)

    local pid = entity:get_player()
    if not pid or pid == -1 then return end

    if key == "hp" then
        o_events.emit("hp_changed", value / player_attributes.max_hp)
    end
end

if vc.is_client() then return end

local sandbox = NEUTRON.sandbox
local rules = NEUTRON.rules
---@cast sandbox neutron.server.sandbox
---@cast rules neutron.server.rules

local player_obj = nil
time.post_runnable(function ()
    local pid = entity:get_player()
    if pid and pid ~= -1 then
        player_obj = sandbox.players.get_by_pid(pid)
    end
end)

function on_grounded(velocity)
    local rule = rules.get_rule("allow-damage")

    if not player_obj or not rule or not rules.players.get_value(player_obj, rule) then
        return
    end

    local gravity = 22.18

    local distance = (velocity ^ 2) / (2 * gravity)
    local damage = math.clamp(math.floor(distance) - 3, 0, math.huge)

    damage = math.max(0, damage - 5)

    player_states.hp = math.max(0, player_states.hp - damage)
end
