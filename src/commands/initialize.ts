import {
    ApplicationCommandType, CategoryChannel,
    ChannelType,
    Client,
    CommandInteraction,
    EmbedBuilder,
    OverwriteType,
    PermissionFlagsBits,
    TextChannel,
    VoiceChannel,
} from "discord.js";
import {Logger} from "../utils/logger";
import {Command} from "../models/command";
import charactersData from "../characters.json";
import {DokeCharacter} from "../models/doke-character";
import {arrayChunkBySize} from "array-chunk-split";
import {CustomId} from "../models/custom-id";

const characters: DokeCharacter[] = charactersData as DokeCharacter[];

export const CHARACTER_CHANNEL = "characters";
export const ROSTER_CHANNEL = "roster";
export const AUDIENCE_CHANNEL = "audience";
export const STAGE_CHANNEL = "The Stage";
export const PURGATORY_CHANNEL = "purgatory";
export const DOKE_CATEGORY = "DandDoke"

export const VOICE_ROLE = "Liceat Loqui"

export const Initialize: Command = {
    name: "initialize",
    description: "populate character channel with character sheets!",
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        Logger.info(
            `${interaction.commandName.toUpperCase()}: request from '${
                interaction.user.username
            }'`
        );

        await createVoiceRole(interaction, VOICE_ROLE);

        await interaction.guild?.roles.fetch();

        const voiceRole = interaction.guild?.roles.cache.find(
            (role) => role.name === VOICE_ROLE
        );

        let dandokeCategory = await interaction.guild?.channels.cache.find(
            (channel) => channel.name === DOKE_CATEGORY
        )

        if (!dandokeCategory) {
            await interaction.guild?.channels
                .create({
                    name: DOKE_CATEGORY,
                    type: ChannelType.GuildCategory
                })
                .catch((err) => {
                    Logger.error(
                        `${interaction.commandName.toUpperCase()}: could not create channel category ${DOKE_CATEGORY}: ${err}`
                    );

                });

            await interaction.guild?.channels.fetch()

            dandokeCategory = await interaction.guild?.channels.cache.find(
                (channel) => channel.name === DOKE_CATEGORY
            )
        }

        const characterChannel = await recreateChannel(
            interaction,
            dandokeCategory as CategoryChannel,
            CHARACTER_CHANNEL,
            "Who will you play?",
            [
                {
                    id: interaction.guild?.roles.everyone,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                    deny: [PermissionFlagsBits.SendMessages],
                    type: OverwriteType.Role,
                },
            ]
        );

        await recreateChannel(
            interaction,
            dandokeCategory as CategoryChannel,
            STAGE_CHANNEL,
            "Where memories come first to make them last",
            [
                {
                    id: interaction.guild?.roles.everyone,
                    deny: [PermissionFlagsBits.Speak],
                    type: OverwriteType.Role,
                },
                {
                    id: voiceRole,
                    allow: [PermissionFlagsBits.Speak],
                    type: OverwriteType.Role,
                },
            ],
            true
        );

        await recreateChannel(
            interaction,
            null,
            PURGATORY_CHANNEL,
            "No one should be in here",
            [
                {
                    id: interaction.guild?.roles.everyone,
                    deny: [PermissionFlagsBits.Speak],
                    type: OverwriteType.Role,
                }
            ],
            true
        );

        await recreateChannel(
            interaction,
            dandokeCategory as CategoryChannel,
            ROSTER_CHANNEL,
            "Adventurers waiting to play!",
            [
                {
                    id: interaction.guild?.roles.everyone,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ReadMessageHistory,
                    ],
                    deny: [PermissionFlagsBits.SendMessages],
                    type: OverwriteType.Role,
                },
            ]
        );

        await recreateChannel(
            interaction,
            dandokeCategory as CategoryChannel,
            AUDIENCE_CHANNEL,
            "Where memories come first to make them last",
            []
        );

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

        Logger.info(`${interaction.commandName.toUpperCase()}: Removing existing character roles...`)

        const allCharacterRoleNames = characters.map((character) => {
            return `${character.name} - ${character.deal}`;
        });

        for (const characterRole of allCharacterRoleNames) {
            const roleToDelete = await interaction.guild?.roles.cache.find(
                (role) => role.name === characterRole
            )

            if (roleToDelete) {
                Logger.info(`${interaction.commandName.toUpperCase()}: Removing existing character roles '${roleToDelete}'`)
                await interaction.guild!.roles.delete(roleToDelete).catch((err) => {
                    Logger.warn(
                        `${interaction.commandName.toUpperCase()}: could not delete role '${roleToDelete.name}': ${err}`
                    );
                });
            }
        }

        await interaction
            .followUp({
                ephemeral: true,
                content:
                    "doke-bot has been initialized!",
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
        await characterChannel.send({embeds}).catch((err) => {
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
    category: CategoryChannel | null,
    channelName: string,
    channelTopic: string,
    permissionOverwrites: any,
    isVoiceChannel: boolean = false
): Promise<TextChannel | VoiceChannel | void | undefined> {
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
            parent: category,
            topic: channelTopic,
            type: isVoiceChannel ? ChannelType.GuildVoice : ChannelType.GuildText,
            permissionOverwrites,
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

async function createVoiceRole(interaction: CommandInteraction, VOICE_ROLE: string) {
    interaction.guild?.roles.fetch();

    if (
        interaction.guild?.roles.cache.some(
            (role) => role.name === VOICE_ROLE
        )
    ) {
        Logger.info(`${CustomId.ENLIST_SELECT}: orator role exists`);
    } else {
        Logger.info(
            `${CustomId.ENLIST_SELECT}: orator role doesnt exist, creating`
        );

        await interaction.guild?.roles
            .create({
                name: VOICE_ROLE,
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
}
