import { Client, EmbedBuilder, Interaction, PermissionsBitField, REST, Routes } from "discord.js";
import { GetMessageContextCommandDefinitions as GetContextCommandDefinitions, GetSlashCommandDefinitions } from "../../scripts/filesystem";
import { CheckClientPermissions, PermissionCheck } from "../scripts/permissions";
import { IMessageContextCommand as IContextCommand } from "./interfaces/contextCommand";
import { ISlashCommand } from "./interfaces/slashCommand";

const path = process.cwd();
const slashCommandDefs: Array<ISlashCommand> = GetSlashCommandDefinitions();
const contextCommandDefs: Array<IContextCommand> = GetContextCommandDefinitions();

const interactions: Array<any> = [slashCommandDefs, contextCommandDefs]

export async function DeleteInteractions(client: Client)
{
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);

    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, "888875214459535360"), { body: [] })
        .then(() => console.log('Successfully deleted all BSS_PUBLIC guild commands.'))
        .catch(console.error);

    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, "929815024158003280"), { body: [] })
        .then(() => console.log('Successfully deleted all BSS_LABS guild commands.'))
        .catch(console.error);

    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, "913885055598886922"), { body: [] })
        .then(() => console.log('Successfully deleted all BSS_STAFF guild commands.'))
        .catch(console.error);
}

export async function PostInteractions(client: Client)
{
    let commands = client.application?.commands;

    let count = 1;

    for(const interactionGroup of interactions)
    {
        for(const interaction of interactionGroup)
        {
            await commands?.create({
                name: interaction.name,
                type: interaction.type,
                description: interaction.description || undefined,
                options: interaction.options || undefined
            });
        }
    }
}

export async function HandleInteraction(client: Client, interaction: Interaction)
{
    if(interaction.isCommand() || interaction.isMessageContextMenuCommand())
    {
        const { commandName: commandName } = interaction;
        let useDefinition: ISlashCommand | IContextCommand;
        let executablePath;

        for(const interactionGroup of interactions)
        {
            for(const interaction of interactionGroup)
            {
                if(interaction.name == commandName)
                {
                    useDefinition = interaction;
                    executablePath = require(`${path}\\src\\Discord\\interactions\\executions\\${useDefinition.executes}`);
                }
            }
        }

        if(CheckClientPermissions(client, interaction.guild))
        {
            executablePath.Run(client, interaction);
        }
        else
        {
            try
            {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("Error | Permissions Required")
                    .setDescription("I require all of the following permissions to function properly. Please grant me all of the following permissions:")
                    .addFields(
                        { name: "MANAGE_SERVER", value: `${PermissionCheck(client, interaction.guild, PermissionsBitField.Flags.ManageGuild)}` },
                        { name: "MANAGE_WEBHOOKS", value: `${PermissionCheck(client, interaction.guild, PermissionsBitField.Flags.ManageWebhooks)}`},
                        { name: "SEND_MESSAGES", value: `${PermissionCheck(client, interaction.guild, PermissionsBitField.Flags.SendMessages)}`},
                        { name: "EMBED_LINKS", value: `${PermissionCheck(client, interaction.guild, PermissionsBitField.Flags.EmbedLinks)}`})
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }
            catch
            {
                console.log("No Permissions");
            }
        }

    }
}