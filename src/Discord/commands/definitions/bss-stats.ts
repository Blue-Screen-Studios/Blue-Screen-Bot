import { ApplicationCommandOptionType } from "discord.js";

export = {
    name: "bss-stats",
    adminOnly: false,
    description: "I will reply with some statstics pulled from the Blue Screen Studios API!",
    options: [
        {
            name: "table",
            description: "Which statistics table should I query in the database?",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices:
            [
                {
                    name: "players",
                    value: "players"
                },
                {
                    name: "servers",
                    value: "servers"
                },
                {
                    name: "has",
                    value: "has"
                }
            ]
        },
        {
            name: "role",
            description: "Which role should I utilize for this operation?",
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
    procedure: "bss-stats"
}