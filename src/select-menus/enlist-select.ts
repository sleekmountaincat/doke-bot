import {
  Client,
  ApplicationCommandType,
  SelectMenuInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Logger } from "../utils/logger";
import charactersData from "../characters.json";
import { DokeCharacter } from "../models/doke-character";
import { CustomId } from "../models/custom-id";
import { SelectMenuSelection } from "../models/select-menu-selection";
import { ROSTER_CHANNEL } from "../commands/initialize";
import {
  removeExistingCharacterRolesFromMember,
  removeRosterEmbedsForMember,
} from "../common/helper-functions";

const characters: DokeCharacter[] = charactersData as DokeCharacter[];

export const EnlistSelect: SelectMenuSelection = {
  name: CustomId.ENLIST_SELECT,
  description: "",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: SelectMenuInteraction) => {
    const selectedCharacterName = interaction.values[0];

    Logger.info(
      `${CustomId.ENLIST_SELECT}: enlist selection from '${interaction.user.username}': ${selectedCharacterName}`
    );

    const character = characters.find((c) => c.name === selectedCharacterName);

    if (!character) {
      Logger.error(
        `${CustomId.ENLIST_SELECT}: couldnt find selected character '${selectedCharacterName}'`
      );

      await interaction.update({ content: "oh no uh oh doke-bot broked" });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(character.name)
      .setURL(character.imgSrc)
      .setDescription(character.deal)
      .addFields({
        name: "On your turn, you can freely:",
        value: character.thing,
      })
      .setImage(character.imgSrc);

    await assignCharacterRole(interaction, character);
    await updateRosterChannel(interaction, character);

    await interaction.update({
      content: `you have chosen your adventurer! please wait to be summoned onto the stage`,
      components: [],
      embeds: [embed],
    });
  },
};

async function assignCharacterRole(
  interaction: SelectMenuInteraction,
  character: DokeCharacter
) {
  const characterRoleName = `${character.name} - ${character.deal}`;

  interaction.guild?.roles.fetch();

  if (
    interaction.guild?.roles.cache.some(
      (role) => role.name === characterRoleName
    )
  ) {
    Logger.info(`${CustomId.ENLIST_SELECT}: character role exists`);
  } else {
    Logger.info(
      `${CustomId.ENLIST_SELECT}: character role doesnt exist, creating`
    );

    await interaction.guild?.roles
      .create({
        name: characterRoleName,
        color: "Random",
        hoist: true,
      })
      .catch((err) => {
        Logger.error(
          `${CustomId.ENLIST_SELECT}: could not create role: ${err}`
        );

        return;
      });
  }

  await interaction.guild?.roles.fetch();

  const characterRole = interaction.guild?.roles.cache.find(
    (role) => role.name === characterRoleName
  );

  const member = interaction.guild?.members.cache.get(interaction.user.id);

  await removeExistingCharacterRolesFromMember(member!, CustomId.ENLIST_SELECT);

  await member!.roles.add(characterRole!).catch((err) => {
    Logger.error(
      `${CustomId.ENLIST_SELECT}: could not attach role '${characterRoleName}' to '${member?.displayName}': ${err}`
    );

    return;
  });

  Logger.info(
    `${CustomId.ENLIST_SELECT}: attached role '${characterRoleName}' to '${member?.displayName}'`
  );
}

async function updateRosterChannel(
  interaction: SelectMenuInteraction,
  character: DokeCharacter
) {
  const rosterChannel = interaction.guild?.channels.cache.find(
    (channel) => channel.name === ROSTER_CHANNEL
  );

  if (rosterChannel && rosterChannel.isTextBased()) {
    await removeRosterEmbedsForMember(
      rosterChannel as TextChannel,
      interaction.user,
      CustomId.ENLIST_SELECT
    );

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setThumbnail(character.imgSrc)
      .addFields([
        {
          name: `Player`,
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: "Character",
          value: `${character.name} - ${character.deal}`,
          inline: true,
        },
      ]);

    await rosterChannel.send({ embeds: [embed] });
  } else {
    Logger.warn(
      `${CustomId.ENLIST_SELECT}: could not update roster channel for '${interaction.user.username}'`
    );
  }

  Logger.info(
    `${CustomId.ENLIST_SELECT}: updated roster channel for '${interaction.user.username}'`
  );
}
