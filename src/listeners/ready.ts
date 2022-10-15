import { Client } from "discord.js";
import { Logger } from "../utils/logger";
import { Commands } from "../commands/commands";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    Logger.info(`registering commands...`);

    await client.application.commands.set(Commands);

    Logger.info(`${client.user.username} is online`);
  });
};
