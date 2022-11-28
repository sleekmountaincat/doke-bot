import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Client,
    CommandInteraction,
} from "discord.js";

import {Command} from "../models/command";
import {Logger} from "../utils/logger";
import {PURGATORY_CHANNEL, STAGE_CHANNEL, VOICE_ROLE} from "./initialize";

export const Devox: Command = {
    name: "devox",
    description: "remove permission to speak in The Stage",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "target",
            description: "who would you like to remove voice from?",
            required: true,
            type: ApplicationCommandOptionType.User,
        },
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        Logger.info(
            `${interaction.commandName.toUpperCase()}: request from '${
                interaction.user.username
            }'`
        );

        const voxTarget = await interaction.options.get("target")!.user;

        const purgatoryChannel = await interaction.guild?.channels.cache.find(
            (c) => c.name === PURGATORY_CHANNEL
        );

        const stageChannel = await interaction.guild?.channels.cache.find(
            (c) => c.name === STAGE_CHANNEL
        );

        Logger.info(
            `${interaction.commandName.toUpperCase()}: devox target is '${
                voxTarget!.username
            }'`
        );

        const member = interaction.guild?.members.cache.get(voxTarget!.id);

        const voiceRole = interaction.guild?.roles.cache.find(
            (role) => role.name === VOICE_ROLE
        );

        await member!.roles.remove(voiceRole!).catch((err) => {
            Logger.error(
                `${interaction.commandName.toUpperCase()}: could not remove vox from '${voxTarget!.username}': ${err}`
            );

            interaction.followUp({
                content: `${interaction.commandName.toUpperCase()}: could not remove vox from '${voxTarget!.username}'`,
            });
        });

        Logger.info(
            `${interaction.commandName.toUpperCase()}: removed vox from '${voxTarget!.username}'`
        );

        await member!.voice.setChannel(purgatoryChannel!.id!).catch((err) => {
            Logger.error(
                `${interaction.commandName.toUpperCase()}: could not move '${voxTarget!.username}' to purgatory: ${err}`
            );
        });

        await member!.voice.setChannel(stageChannel!.id!).catch((err) => {
            Logger.error(
                `${interaction.commandName.toUpperCase()}: could not move '${voxTarget!.username}' to stage: ${err}`
            );
        });

        await interaction.followUp({
            content: `'${voxTarget!.username}' has been silenced`,
        });
    },
};
