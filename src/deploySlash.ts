import { ClientUser, Guild, REST, Routes } from "discord.js";
import { output } from "./functions.js";
import { DiscordClient, SlashData } from "../types/typings.js";


/**
 * @name deploySlash
 * @param {DiscordClient} client The discord client
 * @param {Guild | "all"} guild The guild to deploy to, or "all" to deploy to all guilds
 * @description Deploys slash commands to all guilds
**/
async function deploySlash(client: DiscordClient, guild: Guild | "all") {
	const clientUser = client.user as ClientUser;

	// Set up slash commands
	const rest = new REST().setToken(client.config?.token as string);

	const slashCommands = [];
	for(const command of client.slashCommands){
		const slashData = command.slash(client) as SlashData;

		slashCommands.push(slashData.data.toJSON());
	}

	// Deploy to a single guild
	if(guild !== "all"){
		try {
			await rest.put(Routes.applicationGuildCommands(clientUser.id, guild.id), { body: slashCommands });
		} catch {
			output(client, "error", `Failed to deploy slash commands to guild '${guild.name}' (${guild.id})`);
		}
	}

	// Deploy to all guilds
	for(const guildData of client.guilds.cache){
		const guild = guildData[1];

		await guild.fetch().catch(() => {
			return;
		});

		try {
			await rest.put(Routes.applicationGuildCommands(clientUser.id, guild.id), { body: slashCommands });
		} catch {
			output(client, "error", `Failed to deploy slash commands to guild '${guild.name}' (${guild.id})`);
		}
	}
}


export default deploySlash;
export { deploySlash };