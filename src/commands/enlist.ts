import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ActionRowBuilder,
  SelectMenuBuilder,
} from "discord.js";
import { Logger } from "../utils/logger";
import { Command } from "../models/command";
import charactersData from "../characters.json";
import { DokeCharacter } from "../models/doke-character";
import { CustomId } from "../models/custom-id";
import { arrayChunkBySize } from "array-chunk-split";

const CHARACTERS: DokeCharacter[] = charactersData as DokeCharacter[];

export const Enlist: Command = {
  name: "enlist",
  description: "i want to play!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    Logger.info(
      `${interaction.commandName.toUpperCase()}: request from '${
        interaction.user.username
      }'`
    );

    const charactersChunks = arrayChunkBySize(CHARACTERS, 18);

    var count = 1;

    const components = charactersChunks.map((charactersChunk) => {
      return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId(`${CustomId.ENLIST_SELECT}_${Math.random() * 10000}`)
          .setPlaceholder(`choose your adventurer... (group ${count++})`)
          .addOptions(
            charactersChunk.map((character) => {
              return {
                label: `${character.name}`,
                description: `${character.deal} - ${character.thing}`,
                value: character.name,
              };
            })
          )
      );
    });

    await interaction.followUp({
      ephemeral: true,
      content: "choose one adventurer from the following groups:",
      components,
    });
  },
};
