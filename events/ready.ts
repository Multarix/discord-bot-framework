import { ClientUser } from "discord.js";
import { output } from "../src/functions.js";
import deploySlash from "../src/deploySlash.js";
import getActivity from "./activity/getActivity.js";
import { DiscordClient } from "../types/typings.js";


interface PressenceDecode {
	[key: number]: string
}

const presenceDecode: PressenceDecode = {
	0: "Playing",
	1: "Streaming",
	2: "Listening to",
	3: "Watching",
	4: "Custom Status:",
	5: "Competing in"
};


/**
 * @name ready
 * @param {DiscordClient} client The discord client
 * @description Emitted when the client becomes ready to start working.
 * @returns {Promise<void>}
**/
async function run(client: DiscordClient): Promise<void> {
	const clientUser = client.user as ClientUser;

	output(client, "misc", "Deploying slash commands...");
	await deploySlash(client, "all");

	const presence = getActivity(client);
	clientUser.setPresence(presence);

	output(client, "info", `Logged in as '${clientUser.tag}'`);
	output(client, "info", `Accessing a total of '${client.guilds.cache.size}' server(s) With a total of '${client.users.cache.size}' users`);
	output(client, "info", `Set activity to '${presenceDecode[presence.activities[0].type]} ${presence.activities[0].name}'`);
}


const info = {
	name: "ready",
	description: "Emitted when the client becomes ready to start working.",
	enabled: true
};


export { run, info };