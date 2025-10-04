import { ClientUser, ClientPresenceStatus } from "discord.js";
import { DiscordClient } from "../../types/typings.js";

interface Activity {
	name: string;
	type: 0 | 1 | 2 | 3 | 5;
}

interface Presence {
	status: ClientPresenceStatus;
	afk: boolean;
	activities: Activity[];
}


/**
 * @name getActivity
 * @param {DiscordClient} client
 * @returns {Presence}
**/
function getActivity(client: DiscordClient): Presence {
	const clientUser = client.user as ClientUser;

	/* eslint-disable no-unused-vars */
	enum Pressences {
		Playing,
		Streaming,
		ListeningTo,
		Watching,
		Custom,
		Competing
	}
	/* eslint-enable no-unused-vars */

	// Magic Numbers
	// const COMPETING = 5;
	// // const CUSTOM = 4; // Can't be used with bots
	// const WATCHING = 3;
	// const LISTENING = 2;
	// const STREAMING = 1;
	// const PLAYING = 0;

	let presence: Presence = {
		status: "online",
		afk: false,
		activities: [{
			name: `${client.guilds.cache.size} server${(client.guilds.cache.size > 1) ? "s" : ""} | ${client.config?.prefix}help`,
			type: Pressences.Competing
		}]
	};

	switch(clientUser.id){
		case "304230184494563329":// D&D Bot
			presence = {
				status: "online",
				afk: false,
				activities: [{
					name: `with ${client.guilds.cache.size} ${(client.guilds.cache.size > 1) ? "die" : "dice"} 🎲 | ${client.config?.prefix}help`,
					type: Pressences.Playing
				}]
			};
			break;

		case "628082697553575941": // Beta Bot
			presence = {
				status: "online",
				afk: false,
				activities: [{
					name: `for errors 🔧 | ${client.config?.prefix}help`,
					type: Pressences.Watching
				}]
			};
			break;

		default:
			break;
	}

	return presence;
}


export default getActivity;