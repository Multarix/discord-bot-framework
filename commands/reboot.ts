import { CommandInfo, DiscordClient } from "../types/typings.js";
import { Message } from "discord.js";
import { output } from "../src/functions.js";


async function run(client: DiscordClient, element: Message, _args: string[] = []) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
	const good = client.emojis.cache.get("340357918996299778") || "👍";

	output(client, "misc", "Perfmorming manual reboot...");
	await element.react(good);

	process.exit();
}


const info: CommandInfo = {
	name: "reboot",
	altNames: ["restart"],
	description: "Restarts the bot",
	usage: "reboot",
	enabled: true,
	dmCompatible: true,
	permLevel: 100,
	category: "debug"
};



function slash(client: DiscordClient, _funcs: boolean = false) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
	// if(!funcs){ // We want to get the slash command data
	// 	return {
	// 		data: new SlashCommandBuilder()
	// 			.setName(info.name)
	// 			.setDescription(info.description)
	// 			.setDMPermission(false)
	// 	};
	// }

	return {
		execute: async function execute(interaction: Message) {
			await run(client, interaction);
		}
	};
}

export { run, slash, info };