import { Client, GatewayIntentBits } from "discord.js"
import { token } from "./secret.json"
import ready from "./listeners/ready"
import interactionCreate from "./listeners/interaction-create"
import { Logger } from "./utils/logger"

Logger.info("bot is starting...")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds]
});

ready(client);
interactionCreate(client)

client.login(token);