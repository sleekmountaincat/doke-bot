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

const characters: DokeCharacter[] = charactersData as DokeCharacter[];

export const CHARACTER_CHANNEL = "characters";
export const ROSTER_CHANNEL = "roster";

export const Initialize: Command = {
  name: "initialize",
  description: "populate character channel with charcater sheets!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: request from '${
        interaction.user.username
      }'`
    );

    const characterChannel = await recreateChannel(
      interaction,
      CHARACTER_CHANNEL,
      "choose your adventurer!!"
    );

    await recreateChannel(interaction, ROSTER_CHANNEL, "current roster!!");

    // await removeCharacterRoles(interaction) todo

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
        content:
          "doke-bot has been initialized! character channel created and refreshed, and the roster channel has been created!",
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

async function recreateChannel(
  interaction: CommandInteraction,
  channelName: string,
  channelTopic: string
): Promise<TextChannel | void | undefined> {
  const existingChannel = interaction.guild?.channels.cache.find(
    (c) => c.name === channelName
  );

  if (!existingChannel) {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: channel '${channelName}' does not exist`
    );
  } else {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: channel '${channelName}' exists, deleting`
    );

    await existingChannel.delete().catch((err) => {
      Logger.error(
        `${interaction.commandName.toUpperCase()}: could not delete channel '${channelName}': ${err}`
      );

      interaction.followUp({
        ephemeral: true,
        content:
          "well, shucks. there was an error deleting the initializing doke-bot channels. maybe you should read a book instead for once",
      });
    });
  }

  Logger.info(
    `${interaction.commandName.toUpperCase()}: creating channel '${channelName}'`
  );

  const channel = await interaction.guild?.channels
    .create({
      name: channelName,
      topic: channelTopic,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild?.roles.everyone,
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
        `${interaction.commandName.toUpperCase()}: could not create channel '${channelName}': ${err}`
      );

      interaction.followUp({
        ephemeral: true,
        content:
          "well, shucks. there was an error creating the characters channel",
      });
    });

  return channel;
}
