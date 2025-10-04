import { Guild, GuildMember, Message, ChannelType, PermissionsBitField } from 'discord.js';
import { permLevel } from '../src/functions.js';
import { DiscordClient } from '../types/typings.js';


/**
 * @name messageCreate
 * @param {DiscordClient} client The discord client
 * @param {Message} message The message that was created
 * @description Emitted whenever a message is created.
 * @returns {Promise<void>}
**/
async function run(client: DiscordClient, message: Message) {
	// Handle partials
	try {
		if(message.partial){
			await message.fetch().catch(() => {
				return;
			});
		}
		if(message.author.partial){
			await message.author.fetch().catch(() => {
				return;
			});
		}
		if(message.member?.partial){
			await message.member.fetch().catch(() => {
				return;
			});
		}
	} catch {
		return;
	}


	// Guard Clauses
	const messageIsDefaultType = (message.type === 0);
	if(!messageIsDefaultType) return;

	const isDMChannel = (message.channel.type === ChannelType.DM || message.channel.type === ChannelType.GroupDM);
	if(isDMChannel) return;

	const authorIsBot = message.author.bot;
	if(authorIsBot) return;

	const guild = message.guild as Guild;
	const me = guild.members.me as GuildMember;
	const canViewChannel = (isDMChannel) ? true : message.channel.viewable;
	if(!canViewChannel) return;


	const prefix = client.config?.prefix as string;
	if(!message.content.startsWith(prefix)) return;

	// Check if we can even send a message in response
	if(!message.channel.permissionsFor(me).has(PermissionsBitField.Flags.SendMessages)) return;
	if(!message.channel.permissionsFor(me).has(PermissionsBitField.Flags.EmbedLinks)){
		const str = "I need embed permissions to function. Please grant me them then try the command again.";
		return message.reply({ content: str }).catch(() => {
			return;
		});
	}

	// Replace all line breaks with zero-width spaces and then split via whitespace to get our arguments
	const args = message.content.replace(/(?:\r\n|\r|\n)/g, "\u200b").split(/\s+/g);
	const commandName = args.shift()?.slice(prefix.length).toLowerCase(); // Get the name of the command we want
	if(!commandName) return;

	const altName = client.altNames.get(commandName);
	const command = client.commands.get(altName as string) || client.commands.get(commandName);

	if(!command) return;
	if(!command.info.enabled || command.info.permLevel > permLevel(client, message.author, message.channel)) return;
	// At this point, the command exists, is enabled and the person has permission to run it

	await command.run(client, message, args);
}


const info = {
	name: "messageCreate",
	description: "Emitted whenever a message is created.",
	enabled: true
};


export { run, info };