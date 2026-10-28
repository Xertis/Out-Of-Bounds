if not vc.is_client() then return end

local tsf = entity.transform
local body = entity.rigidbody
local rig = entity.skeleton

local scale = {1, 1, 1}
local rotation = mat4.rotate({
    math.random(), math.random(), math.random()
}, 360)

local dropitem = ARGS
if dropitem.item then
    dropitem.id = item.index(dropitem.item)
end

do
    local matrix = mat4.idt()
    rig:set_model(0, item.model_name(dropitem.id))
    local bodysize = math.min(scale[1], scale[2], scale[3])
    body:set_size({scale[1], bodysize, scale[3]})
    mat4.mul(matrix, rotation, matrix)
    mat4.scale(matrix, scale, matrix)
    rig:set_matrix(0, matrix)
end

local hint = gfx.text3d.show(
    {0, 0.2, 0},
    "",
    {
        display = "xy_free_billboard",
        scale = 0.1,
        render_distance = 2000,
        font = "gui_icons"
    }
)

gfx.text3d.set_entity(hint, entity:get_uid())

local hint_scale = 0
local hint_target = 0

function on_aim_on(playerid)
    gfx.text3d.set_text(hint, "R")
    hint_target = 1
end

function on_aim_off(playerid)
    hint_target = 0
end

function on_despawn()
    gfx.text3d.hide(hint)
end

function on_render()
    local dt = time.delta()

    mat4.rotate(rotation, {0, 1, 0}, 240 * dt, rotation)
    mat4.rotate(rotation, {0, 0, 1}, 240 * dt, rotation)

    local matrix = mat4.idt()
    mat4.mul(matrix, rotation, matrix)
    mat4.scale(matrix, scale, matrix)
    rig:set_matrix(0, matrix)

    local speed = 12
    hint_scale = hint_scale + (hint_target - hint_scale) * math.min(dt * speed, 1)

    gfx.text3d.update_settings(hint, {
        scale = 0.1 * hint_scale
    })

    if hint_scale < 0.01 and hint_target == 0 then
        gfx.text3d.set_text(hint, "")
    end
end

function on_used() end
