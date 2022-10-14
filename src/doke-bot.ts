import { Client, GatewayIntentBits } from "discord.js";
import { token } from "./secret.json";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interaction-create";

console.log("bot is starting...");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

ready(client);
interactionCreate(client)

client.login(token);

// import fs from "node:fs";
// import path from "node:path";
// import { Client, Collection, GatewayIntentBits } from "discord.js";
// import { token } from "./secret.json";
// import { registerCommands } from "./register-commands";

// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.commands = new Collection();
// const commandsPath = path.join(__dirname, "commands");
// const commandFiles = fs
//   .readdirSync(commandsPath)
//   .filter((file) => file.endsWith(".js"));

// for (const file of commandFiles) {
//   const filePath = path.join(commandsPath, file);
//   const command = require(filePath);
//   client.commands.set(command.data.name, command);
// }

// client.once("ready", () => {
//   console.log("Ready!");
// });

// client.on("interactionCreate", async (interaction) => {
//   if (!interaction.isChatInputCommand()) return;

//   const command = client.commands.get(interaction.commandName);

//   if (!command) return;

//   try {
//     await command.execute(interaction);
//   } catch (error) {
//     console.error(error);
//     await interaction.reply({
//       content: "There was an error while executing this command!",
//       ephemeral: true,
//     });
//   }
// });

// registerCommands().then(() => {
//   client.login(token);
// })



