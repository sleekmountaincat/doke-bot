import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
  TextChannel,
  EmbedBuilder
} from "discord.js";
import { Logger } from "../utils/logger";
import { Command } from "../models/command";
import * as charactersData from "../characters.json"
import { DokeCharacter } from "src/models/doke-character";

const CHARACTER_CHANNEL = "characters";
const characters: DokeCharacter[] = charactersData as DokeCharacter[]

export const Characters: Command = {
  name: "characters",
  description: "populate character channel with charcater sheets!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: request from '${interaction.user.username}'`
    );

    const guild = interaction.guild;

    const existingCharacterChannel = guild?.channels.cache.find(
      (c) => c.name === CHARACTER_CHANNEL
    );

    if (!existingCharacterChannel) {
      Logger.info(
        `${interaction.commandName.toUpperCase()}: character channel (${CHARACTER_CHANNEL}) does not exist`
      );
    } else {
      Logger.info(
        `${interaction.commandName.toUpperCase()}: character channel (${CHARACTER_CHANNEL}) exists, deleting`
      );
      await existingCharacterChannel.delete().catch((err) => {
        Logger.error(
          `${interaction.commandName.toUpperCase()}: could not delete channel (${CHARACTER_CHANNEL}): ${err}`
        );

        return interaction.followUp({
          ephemeral: true,
          content:
            "well, shucks. there was an error deleting the characters channel",
        });
      });
    }

    Logger.info(
      `${interaction.commandName.toUpperCase()}: creating character channel (${CHARACTER_CHANNEL})`
    );

    const characterChannel = await guild?.channels
      .create({
        name: CHARACTER_CHANNEL,
        topic: "choose your adeventurer!",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild?.roles.everyone,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
            ],
            deny: [PermissionFlagsBits.SendMessages],
            type: OverwriteType.Role,
          },
        ],
      })
      .catch((err) => {
        Logger.error(
          `${interaction.commandName.toUpperCase()}: could not create character channel (${CHARACTER_CHANNEL}): ${err}`
        );

        return interaction.followUp({
          ephemeral: true,
          content:
            "well, shucks. there was an error creating the characters channel",
        });
      });

    Logger.info(
      `${interaction.commandName.toUpperCase()}: populating character channel (${CHARACTER_CHANNEL})`
    );

    if (characterChannel instanceof TextChannel) {
      await populateCharacterChannel(characterChannel);
    } else {
      Logger.error(
        `${interaction.commandName.toUpperCase()}: could not find character channel (${CHARACTER_CHANNEL})`
      );

      await interaction.followUp({
        ephemeral: true,
        content: "hmm, could not find character channel...",
      });
    }

    await interaction.followUp({
      ephemeral: true,
      content: "character channel refreshed!",
    });
  },
};

async function populateCharacterChannel(characterChannel: TextChannel) {
  const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle(characters[0].name)
	.setURL(characters[0].imgSrc)
	.setDescription(characters[0].deal)
	.addFields(
		{ name: 'On your turn, you can freely:', value: characters[0].thing },
	)
	.setImage(characters[0].imgSrc)
  
  characterChannel.send( {embeds: [exampleEmbed]} );
}
