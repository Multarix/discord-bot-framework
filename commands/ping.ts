import { CommandInfo, DiscordClient } from "../types/typings.js";
import { SlashCommandBuilder, Message, ChatInputCommandInteraction, InteractionContextType } from "discord.js";


async function run(client: DiscordClient, element: Message | ChatInputCommandInteraction, _args: string[] = []) { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
	const sent = await element.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });

	const pingMessage = `Pong!: ${sent.createdTimestamp - element.createdTimestamp}ms\nHeartbeat ping is: ${Math.round(client.ws.ping)}ms`;
	if(element instanceof ChatInputCommandInteraction) return element.editReply({ content: pingMessage });

	return await sent.edit({ content: pingMessage });
}


const info: CommandInfo = {
	name: "ping",
	altNames: ["discord"],
	description: "Gets the bot ping of the bot",
	usage: "ping",
	enabled: true,
	dmCompatible: true,
	permLevel: 0,
	category: "system"
};



function slash(client: DiscordClient, funcs: boolean = false) {
	if(!funcs){ // We want to get the slash command data
		const usableLocations = [InteractionContextType.Guild];
		if(info.dmCompatible){
			usableLocations.push(InteractionContextType.BotDM);
			usableLocations.push(InteractionContextType.PrivateChannel);
		}

		return {
			data: new SlashCommandBuilder()
				.setName(info.name)
				.setDescription(info.description)
				.setContexts(usableLocations)
		};
	}

	return {
		execute: async function execute(interaction: Message) {
			await run(client, interaction);
		}
	};
}

export { run, slash, info };