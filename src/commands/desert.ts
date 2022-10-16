import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Client,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import {
  removeExistingCharacterRolesFromMember,
  removeRosterEmbedsForMember,
} from "../common/helper-functions";
import { Command } from "../models/command";
import { Logger } from "../utils/logger";
import { ROSTER_CHANNEL } from "./initialize";

export const Desert: Command = {
  name: "desert",
  description: "i dont want to play!",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "target",
      description: "who do you want to force to desert?",
      required: false,
      type: ApplicationCommandOptionType.User,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: request from '${
        interaction.user.username
      }'`
    );

    const desertTarget = interaction.options.get("target")?.user;

    const userToDesert = desertTarget ? desertTarget : interaction.user;

    if (desertTarget) {
      Logger.info(
        `${interaction.commandName.toUpperCase()}: desert target is '${
          desertTarget.username
        }'`
      );
    }

    const member = interaction.guild?.members.cache.get(userToDesert.id);

    const rosterChannel = interaction.guild?.channels.cache.find(
      (channel) => channel.name === ROSTER_CHANNEL
    );

    if (rosterChannel && rosterChannel.isTextBased()) {
      await removeRosterEmbedsForMember(
        rosterChannel as TextChannel,
        userToDesert,
        interaction.commandName.toUpperCase()
      );
    }

    await removeExistingCharacterRolesFromMember(
      member!,
      interaction.commandName.toUpperCase()
    );

    Logger.info(
      `${interaction.commandName.toUpperCase()}: deserted '${
        userToDesert.username
      }'`
    );

    interaction.followUp({
      content: `${
        desertTarget ? userToDesert.username + " is" : "you are"
      } no longer playing`,
    });
  },
};
