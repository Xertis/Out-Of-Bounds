local tsf = entity.transform
local body = entity.rigidbody
local def_index = entity:def_index()

if vc.is_client() then return end

local spawn_time = world.get_total_time()

dropitem = ARGS
if dropitem.item then
    dropitem.id = item.index(dropitem.item)
end
if SAVED_DATA.spawn_time then
    spawn_time = SAVED_DATA.spawn_time
end
if SAVED_DATA.item then
    dropitem.id = item.index(SAVED_DATA.item)
    dropitem.count = SAVED_DATA.count
    dropitem.data = SAVED_DATA.data
end
function on_save()
    SAVED_DATA.item = item.name(dropitem.id)
    SAVED_DATA.count = dropitem.count
    SAVED_DATA.data = dropitem.data
    SAVED_DATA.spawn_time = spawn_time
end
function on_sensor_enter(index, oid)
    local other = entities.get(oid)
    if not other then
        return
    end
    if index ~= 0 then
        return
    end
    if other:get_player() ~= -1 then
        return
    end
    if other:def_index() ~= def_index then
        return
    end
    local odrop = other:get_component("game:drop_logic").dropitem
    if odrop.id == dropitem.id and not odrop.data then
        local stack = item.stack_size(dropitem.id)
        local sum = (dropitem.count or 0) + (odrop.count or 0)
        if sum == 0 then
            dropitem:despawn()
            odrop:despawn()
            return
        elseif sum <= stack then
            dropitem.count = 0
            odrop.count = sum
            entity:despawn()
        end
    end
end

local JUMP_VELOCITY = 4.5
local PICKUP_DELAY = 0.15

local pickup_player = -1
local pickup_timer = 0.0

function on_used(pid)
    if pickup_player ~= -1 then
        return
    end
    pickup_player = pid
    pickup_timer = PICKUP_DELAY
    body:set_vel({0, JUMP_VELOCITY, 0})
end

function on_physics_update(delta)
    if pickup_player == -1 then
        return
    end
    if pickup_timer > 0 then
        pickup_timer = pickup_timer - delta
        return
    end
    if body:is_enabled() then
        body:set_enabled(false)
    end
    local pl = entities.get(player.get_entity(pickup_player))
    if not pl then
        entity:despawn()
        return
    end
    local pos = tsf:get_pos()
    local target = pl.transform:get_pos()
    local dir = vec3.sub(target, pos)
    local dist = vec3.length(dir)
    if dist < 0.8 then
        local remains = inventory.add(
            player.get_inventory(pickup_player),
            dropitem.id,
            dropitem.count,
            dropitem.data
        )
        if remains > 0 then
            UTILS.drop(
                tsf:get_pos(),
                dropitem.id,
                dropitem.count,
                dropitem.data
            )
        end
        if remains < dropitem.count then
            audio.play_sound_2d(
                "events/pickup",
                0.5,
                0.8 + math.random() * 0.4,
                "regular"
            )
        end
        entity:despawn()
        return
    end
    vec3.normalize(dir, dir)
    local speed = 16.0
    vec3.mul(dir, speed * delta, dir)
    tsf:set_pos(vec3.add(pos, dir))
end

function on_update()
    if world.get_total_time() - spawn_time > DROP_LIFETIME then
        entity:despawn()
    end
end
