import "client:api/v2/api"

let identity = "Player";
let username = "Player";

export const contract: Neutron.Shell.Contract = {
    players: {
        get_main_identity: () => identity,
        set_main_identity: (id) => { identity = id; },
        get_main_username: () => username,
        set_main_username: (name) => { username = name; },
    },

    handlers: {
        game: {
            join: (server, player) => {
                debug.print(`joined ${server.ip} as ${player.name}`);
            },
            on_disconnect: (server, packet) => {
                debug.print(`disconnected from ${server.ip}: ${packet?.reason ?? "no reason"}`);
            },
        },
    },

    init: () => {
        menu.page = "main"
    },
};
