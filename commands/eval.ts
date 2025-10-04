import { CommandInfo, DiscordClient } from "../types/typings.js";
import { ClientUser, Message, EmbedBuilder, TextChannel } from "discord.js";
import { clean } from "../src/functions.js";


async function run(client: DiscordClient, element: Message, args: string[] = []) {
	const clientUser = client.user as ClientUser;
	const channel = element.channel as TextChannel;

	if(!args) return await element.reply({ content: "You need to provide some code to evaluate!" });

	const good = client.emojis.cache.get("340357918996299778") || "👍";
	const bad = client.emojis.cache.get("340357882606256137") || "👎";

	const embed = new EmbedBuilder()
		.setFooter({ text: clientUser.username, iconURL: clientUser.displayAvatarURL() })
		.setTimestamp();

	const code = args.join(" ").replace(/\u200b/g, "\n");
	const inString = `\`\`\`javascript\n${code}\n\`\`\``;
	try {
		const evaled = eval(code);
		const cleaned = await clean(client, evaled);
		const outString = `\`\`\`javascript\n${cleaned}\n\`\`\``;

		embed.setColor(2734377);

		if(outString.length >= 1024 || inString.length >= 1024){
			console.log(cleaned);
			const field = [{ name: `Success ${good}`, value: "The input or output was too long, check the console for details" }];

			embed.addFields(field);

			return await channel.send({ embeds: [embed] });
		}

		const fields = [
			{ name: 'Eval Input', value: inString, inline: false },
			{ name: `Eval Output ${good}`, value: outString, inline: false }
		];

		embed.addFields(fields);
		return await channel.send({ embeds: [embed] }).catch(e => console.log(e));
	} catch (err){
		const errMsg = await clean(client, err as string);
		const errString = `\`\`\`javascript\n${errMsg}\n\`\`\``;

		embed.setColor(14487568);

		if(errString.length >= 1024 || inString.length >= 1024){
			console.log(errMsg);
			const field = [{ name: `ERROR ${bad}`, value: "The input or output was too long, check the console for details" }];

			embed.addFields(field);

			return await channel.send({ embeds: [embed] });
		}

		const fields = [
			{ name: 'Eval Input', value: inString, inline: false },
			{ name: `Eval Output ${bad}`, value: errString, inline: false }
		];

		embed.addFields(fields);
		return await channel.send({ embeds: [embed] });
	}
}


const info: CommandInfo = {
	name: "eval",
	altNames: ["e", "js"],
	description: "Evaluates Javascript code",
	usage: "eval {code}",
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