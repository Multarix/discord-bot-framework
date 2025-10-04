import { Guild, ClientUser } from "discord.js";
import { output } from "../src/functions.js";
import deploySlash from "../src/deploySlash.js";
import getActivity from "./activity/getActivity.js";
import { DiscordClient } from "../types/typings.js";


/**
 * @name guildCreate
 * @param {DiscordClient} client The discord client
 * @param {Guild} guild The guild that was joined
 * @description Emitted whenever the client joins a guild.
 * @returns {Promise<void>}
**/
async function run(client: DiscordClient, guild: Guild): Promise<void> {
	const clientUser = client.user as ClientUser;

	await guild.fetch().catch(() => {
		return;
	});

	await deploySlash(client, guild);

	output(client, "misc", `Joined a new server: '${guild.name}' (${guild.id})`);

	const presence = getActivity(client);
	clientUser.setPresence(presence);
}

const info = {
	name: "guildCreate",
	description: "Emitted whenever the client joins a guild.",
	enabled: true
};


export { run, info };