import { CommandInfo, DiscordClient } from "../types/typings.js";
import { version, Message, EmbedBuilder, ClientUser } from "discord.js";
import os from "os";
import { humanTime } from "../src/functions.js";

async function run(client: DiscordClient, element: Message, _args: string[] = []) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
	const clientUser = client.user as ClientUser;
	const duration = humanTime(client.uptime as number, "\\Ddays, \\Hhrs, \\mmins, \\ssecs");

	const cpuType = os.cpus()[0].model.split(/\s+/g).join(" ");
	const embed = new EmbedBuilder()
		.setAuthor({ name: "System Information" })
		.setColor(13238272)
		.setThumbnail(clientUser.displayAvatarURL())
		.setFooter({ text: clientUser.username, iconURL: clientUser.displayAvatarURL() })
		.setTimestamp();

	const embedFields = [
		{ name: "CPU",				value: cpuType,																inline: true },
		{ name: "Architecture",		value: os.arch(),															inline: true },
		{ name: "OS",				value: `${os.platform}`,													inline: true },
		{ name: "Discord.js",		value: `v${version}`, 														inline: true },
		{ name: "Node.js",			value: process.version.toString(), 											inline: true },
		{ name: "Memory Usage",		value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, 	inline: true },
		{ name: "Total Memory",		value: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`,				inline: true },
		{ name: "Uptime",			value: duration, 															inline: false }
	];

	embed.addFields(embedFields);

	return element.reply({ embeds: [embed] });
}

const info: CommandInfo = {
	name: "system",
	altNames: ["sys", "sysinfo"],
	description: "Lists information about the system the bot is running on",
	usage: "system",
	enabled: true,
	dmCompatible: true,
	permLevel: 100,
	category: "debug"
};


function slash(client: DiscordClient, funcs: boolean = false) { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
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