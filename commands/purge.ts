import { CommandInfo, DiscordClient } from "../types/typings.js";
import { SlashCommandBuilder, Message, ChatInputCommandInteraction, PermissionsBitField, PermissionFlagsBits, TextChannel, Guild, GuildMember, InteractionContextType } from "discord.js";


async function run(_client: DiscordClient, element: Message | ChatInputCommandInteraction, args: string[] = []) {
	const channel = element.channel as TextChannel;
	const guild = element.guild as Guild;

	const botCanDelete = channel.permissionsFor(guild.members.me as GuildMember).has(PermissionsBitField.Flags.ManageMessages);
	const botCanSee = channel.permissionsFor(guild.members.me as GuildMember).has(PermissionsBitField.Flags.ViewChannel);
	if(!botCanDelete || !botCanSee) return element.reply({ content: "I do not have permission to delete messages in this channel", ephemeral: true });

	const isSlashCommand = (element instanceof ChatInputCommandInteraction);
	if(isSlashCommand) await element.deferReply({ ephemeral: true });

	if(!args[0]) return await element.reply({ content: "You need to specify a number of messages to delete", ephemeral: true  });
	if(!parseInt(args[0])) return await element.reply({ content: `Oops! \`${args[0]}\` Doesn't seem to be a number!`, ephemeral: true  });

	const messagecount = parseInt(args[0]);
	let toDelete = messagecount;
	if(!isSlashCommand) toDelete += 1;
	if(toDelete >= 101) toDelete = 100;

	const messages = await channel.messages.fetch({ limit: toDelete });

	const wasSuccessful = await channel.bulkDelete(messages, true);
	if(isSlashCommand && wasSuccessful) await element.editReply({ content: `Successfully deleted ${toDelete} messages` });
}


const info: CommandInfo = {
	name: "purge",
	altNames: ["md", "massdelete"],
	description: "Mass deletes a specified amount of messages",
	usage: "purge <number>",
	enabled: true,
	dmCompatible: false,
	permLevel: 2,
	category: "moderation"
};


function slash(client: DiscordClient, funcs: boolean = false) {
	if(!funcs){ // We want to get the slashCommand data
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
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
				.addIntegerOption(option => option.setRequired(true).setName("number").setDescription("The ammount of messages to delete").setMinValue(1).setMaxValue(100))
		};
	}

	return {
		execute: async function execute(interaction: ChatInputCommandInteraction) {
			const command = interaction.options.getInteger("number") as number;

			const args = [];
			args.push(command.toString());

			await run(client, interaction, args);
		}
	};
}

export { run, slash, info };