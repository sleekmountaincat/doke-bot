import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { Logger } from "../utils/logger";
import { Command } from "../models/command";
import charactersData from "../characters.json";
import { DokeCharacter } from "../models/doke-character";
import { arrayChunkBySize } from "array-chunk-split";

const CHARACTER_CHANNEL = "characters";
const characters: DokeCharacter[] = charactersData as DokeCharacter[];

export const Characters: Command = {
  name: "characters",
  description: "populate character channel with charcater sheets!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: request from '${
        interaction.user.username
      }'`
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
      await populateCharacterChannel(characterChannel, interaction);
    } else {
      Logger.error(
        `${interaction.commandName.toUpperCase()}: could not find character channel (${CHARACTER_CHANNEL})`
      );

      await interaction.followUp({
        ephemeral: true,
        content: "hmm, could not find character channel...",
      });
    }

    await interaction
      .followUp({
        ephemeral: true,
        content: "character channel refreshed!",
      })
      .catch((err) => {
        Logger.warn(
          `${interaction.commandName.toUpperCase()}: could not respond to request: ${err}`
        );
      });
  },
};

async function populateCharacterChannel(
  characterChannel: TextChannel,
  interaction: CommandInteraction
) {
  const characterEmbeds: EmbedBuilder[] = characters.map((character) => {
    return new EmbedBuilder()
      .setColor("Random")
      .setTitle(character.name)
      .setURL(character.imgSrc)
      .setDescription(character.deal)
      .addFields({
        name: "On your turn, you can freely:",
        value: character.thing,
      })
      .setImage(character.imgSrc);
  });

  const characterEmbedsChunks = arrayChunkBySize(characterEmbeds, 10);

  for (const embeds of characterEmbedsChunks) {
    await characterChannel.send({ embeds }).catch((err) => {
      Logger.error(
        `${interaction.commandName.toUpperCase()}: could not send character embed chunk: ${err}`
      );

      return interaction.followUp({
        ephemeral: true,
        content:
          "well, shucks. there was an error populating a portion of the characters channel. so ry",
      });
    });
  }
}
