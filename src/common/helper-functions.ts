import { GuildMember, TextChannel, User } from "discord.js";
import { DokeCharacter } from "../models/doke-character";
import { Logger } from "../utils/logger";
import charactersData from "../characters.json";

const characters: DokeCharacter[] = charactersData as DokeCharacter[];

export async function removeExistingCharacterRolesFromMember(
  member: GuildMember,
  caller: string
) {
  const allCharacterRoleNames = characters.map((character) => {
    return `${character.name} - ${character.deal}`;
  });

  const memberRoles = member.roles.cache;

  const rolesToDelete = memberRoles.filter((role) =>
    allCharacterRoleNames.includes(role.name)
  );

  if (rolesToDelete.size) {
    Logger.info(
      `${caller}: found existing roles, removing member '${
        member.displayName
      }' from: '${rolesToDelete.map((role) => {
        return role.name;
      })}'`
    );

    for (const role of rolesToDelete) {
      await member.roles.remove(role).catch((err) => {
        Logger.error(
          `${caller}: could not remove member '${member.displayName}' from role: '${role[1].name}': ${err}`
        );
      });
    }
  }
}

export async function removeRosterEmbedsForMember(
  rosterChannel: TextChannel,
  user: User,
  caller: string
) {
  const rosterMessages = await rosterChannel.messages.fetch({ limit: 100 });

  for (const message of rosterMessages) {
    if (message[1].embeds && message[1].embeds.length) {
      const rosterEmbedPlayerField = message[1].embeds[0].fields.find(
        (field) => field.name === "Player"
      );

      if (rosterEmbedPlayerField?.value === `<@${user.id}>`) {
        Logger.info(
          `${caller}: removing roster message for '${user.username}'`
        );

        await rosterChannel.messages.delete(message[0]).catch((err) => {
          Logger.warn(
            `${caller}: could not remove roster message for '${user.username}': ${err}`
          );
        });
      }
    }
  }
}
