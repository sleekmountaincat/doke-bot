import { CommandInteraction, Client, ApplicationCommandType } from "discord.js";
import { Command } from "../models/command";

export const Enlist: Command = {
    name: "enlist",
    description: "i want to play!",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        console.log(`receeived enlist request from ${interaction.user.username}`)
        const content = "Hello there!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};