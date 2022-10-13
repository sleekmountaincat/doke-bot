// const Discord = require('discord.js');
// const client = new Discord.Client({intents: 97805});

const TOKEN = require('./secret.json').token
const CLIENT_ID = require('./secret.json').clientId
const { REST, Routes } = require('discord.js')

const commands = [
	{
		name: 'signup',
		description: 'Signup to play!!!',
	},
]

const rest = new REST({ version: '10' }).setToken(TOKEN)
async function initBot() {
	try {
		console.log('Started refreshing application (/) commands.')

		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
}


(async () => {
  await initBot()

  const { Client, GatewayIntentBits } = require('discord.js');
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'signup') {
      await interaction.reply('you are now signedup');
    }
  });

  client.login(TOKEN);
})();