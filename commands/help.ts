import { CommandInfo, DiscordClient } from "../types/typings.js";
import { SlashCommandBuilder, Message, ClientUser, ChatInputCommandInteraction, EmbedBuilder, ColorResolvable, GuildMemberRoleManager, InteractionContextType, TextBasedChannel } from "discord.js";
import { permLevel, handleElement, caseFix } from "../src/functions.js";


async function run(client: DiscordClient, element: Message | ChatInputCommandInteraction, args: string[] = []) {
	const clientUser = client.user as ClientUser;
	const isSlashCommand = (element instanceof ChatInputCommandInteraction);
	const user = isSlashCommand ? element.user : element.author;
	// if(isSlashCommand) await element.deferReply({ ephemeral: true }); // Don't need deferred here


	// Set up the Embed
	const embed = new EmbedBuilder()
		.setFooter({ text: clientUser.username, iconURL: clientUser.displayAvatarURL() })
		.setTimestamp();

	// const iconURL = element?.guild?.iconURL();
	// if(iconURL) embed.setThumbnail(iconURL);

	if(element.member?.roles){
		let embedColor: ColorResolvable | null = null;
		const roles = element.member.roles as GuildMemberRoleManager;
		if(roles.highest?.colors) embedColor = roles.highest.colors.primaryColor;
		if(embedColor) embed.setColor(embedColor);
	}


	const userPermLevel = permLevel(client, user, element.channel as TextBasedChannel);

	// if args[0] is a command, show the command's info (assuming the user has permission to do so)
	if(args[0]){
		const altName = client.altNames.get(args[0]);
		const command = (altName) ? client.commands.get(altName) : client.commands.get(args[0]);

		if(command){
			const permissionToRun = (command.info.permLevel <= userPermLevel);
			if(command.info.enabled && permissionToRun){
				const prefix = client.config?.prefix;

				const title = caseFix(command.info.name);
				const category = caseFix(command.info.category);

				let aliasNames = "";
				if(command.info.altNames.length) aliasNames = command.info.altNames.join("`, `");
				const aliases = `\`${aliasNames}\``;
				const usage = `${prefix}${command.info.usage}`;
				const usageField = "\nExample Usage:\n```fix\n" + usage + "```";

				const fields = [
					{ name: "Category", value: category, inline: true },
					{ name: "Aliases", value: aliases, inline: true },
					{ name: "Description", value: command.info.description, inline: false },
					{ name: "Usage", value: usageField, inline: false }
				];

				embed.setAuthor({ name: title }).addFields(fields);
				return await handleElement(element, isSlashCommand, { embeds: [embed], ephemeral: true });
			}
		}
	}

	// Get all the commands
	const commands = [...client.commands.values()];

	// Find the size of the longest command name
	const longest = commands.reduce((long, command) => Math.max(long, command.info.name.length), 0);

	// Sort everything into the correct categories
	interface Categories {
		[key: string]: string[]
	}
	const categories: Categories = {};
	for(const command of commands){
		// If the user can't even run the command, don't show it
		if(!command.info.enabled) continue;
		if(command.info.permLevel > userPermLevel) continue;
		// Pad the name with spaces so all the names line up at the same spot
		const paddedName = command.info.name.padEnd(longest, " ");

		// Split the commands into categories, creating the category if it doesn't exist
		const category = caseFix(command.info.category);
		if(!categories[category]) categories[category] = [];

		categories[category].push(`\`${paddedName}  ➜\` ${command.info.description}`);
	}

	// Each category gets its own embedField
	const embedFields = [];
	for(const category of Object.keys(categories).sort()){
		const embedData = { name: category, value: categories[category].join("\n"), inline: false };
		embedFields.push(embedData);
	}

	embed.setAuthor({ name: `Commands for:  ${user.username}`, iconURL: user.displayAvatarURL() })
		.setDescription(`**Commands available in:** ${element.channel}\nUse \`${client.config?.prefix}help {command}\` for details on a specific command.`)
		.addFields(embedFields);

	// If the command is a slash command
	if(isSlashCommand) return await element.reply({ embeds: [embed], ephemeral: true });

	// Otherwise send a DM to the user, and inform them in the channel that they have been DMed
	await user.send({ embeds: [embed] }).catch(() => {
		return;
	});
	await element.reply({ content: "I've sent you a DM with all of your available commands.\nIf you didn't receive one, please check your DM settings." });
}


const info: CommandInfo = {
	name: "help",
	altNames: ["h", "commands"],
	description: "Displays a list of commands",
	usage: "help {command}",
	enabled: true,
	dmCompatible: true,
	permLevel: 0,
	category: "system"
};



function slash(client: DiscordClient, funcs: boolean = false) {
	if(!funcs){ // We want to get the slashCommand data
		const usableLocations = [InteractionContextType.Guild];
		if(info.dmCompatible){
			usableLocations.push(InteractionContextType.BotDM);
			usableLocations.push(InteractionContextType.PrivateChannel);
		}

		/**
		 * @name commandChoices
		 * @returns {object[]} The slash command data
		 * @description Returns an array of choices for the slash command
		**/
		const commandChoices = () => {
			const commands = [...client.commands.values()];
			const choices = [];
			for(const command of commands){
				if(!command.info.enabled) continue;
				if(command.info.permLevel > 10) continue;
				choices.push({ name: command.info.name, value: command.info.name });
			}

			if(choices.length > 25) choices.slice(0, 25);
			return choices;
		};

		const inf = {
			data: new SlashCommandBuilder()
				.setName(info.name)
				.setDescription(info.description)
				.setContexts(usableLocations)
				.addStringOption(option => option.setRequired(false).setName("command").setDescription("The command to get help for").addChoices(...commandChoices()))
		};
		return inf;
	}

	return {
		execute: async function execute(interaction: ChatInputCommandInteraction) {
			const command = interaction.options.getString("command");

			const args = [];
			if(command){
				args.push(command);
			}

			await run(client, interaction, args);
		}
	};
}

export { run, slash, info };