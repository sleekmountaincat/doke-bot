import {
  Client,
  ApplicationCommandType,
  ActionRowBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  EmbedBuilder,
} from "discord.js";
import { Logger } from "../utils/logger";
import charactersData from "../characters.json";
import { DokeCharacter } from "../models/doke-character";
import { CustomId } from "../models/custom-id";
import { SelectMenuSelection } from "../models/select-menu-selection";

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

    await interaction.update({
      content: `you have chosen your adventurer! please wait to be summoned onto the stage`,
      components: [],
      embeds: [embed]
    });
  },
};
