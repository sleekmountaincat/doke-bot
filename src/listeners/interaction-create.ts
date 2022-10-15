import {
  CommandInteraction,
  Client,
  Interaction,
  SelectMenuInteraction,
} from "discord.js";
import { Logger } from "../utils/logger";
import { Commands } from "../commands/commands";
import { SelectMenuSelections } from "../select-menus/select-menues";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isSelectMenu()) {
      await handleSelection(client, interaction);
    } else {
      Logger.warn(
        `received unknown interaction type (${interaction.type}) from ${interaction.user.username}`
      );
    }
  });
};

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);

  if (!slashCommand) {
    Logger.error(`error: can't find command '${interaction.commandName}'`);
    interaction.followUp({ content: "uh oh. doke-bot doke-broke" });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  slashCommand.run(client, interaction);
};

const handleSelection = async (
  client: Client,
  interaction: SelectMenuInteraction
): Promise<void> => {
  const customId = interaction.customId.split("_")[0];
  const selectMenuSelection = SelectMenuSelections.find(
    (c) => c.name === customId
  );

  if (!selectMenuSelection) {
    Logger.error(
      `error: can't find select menu slection handler for '${interaction.customId}'`
    );
    interaction.followUp({ content: "uh oh. doke-bot doke-broke" });
    return;
  }

  selectMenuSelection.run(client, interaction);
};
