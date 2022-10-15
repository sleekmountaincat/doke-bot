import {
  ChatInputApplicationCommandData,
  Client,
  SelectMenuInteraction,
} from "discord.js";

export interface SelectMenuSelection extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: SelectMenuInteraction) => void;
}
