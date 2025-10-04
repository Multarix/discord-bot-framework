import { CommandInfo, DiscordClient } from "../types/typings.js";
import { User, SlashCommandBuilder, ClientUser, Message, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, Role } from "discord.js";
import { handleElement, humanTime, caseFix, grabUser } from "../src/functions.js";


async function run(client: DiscordClient, element: Message | ChatInputCommandInteraction, args: string[] = []) {
	const clientUser = client.user as ClientUser;
	const isSlashCommand = (element instanceof ChatInputCommandInteraction);
	let user = isSlashCommand ? element.user : element.author;
	// if(isSlashCommand) await element.deferReply({ ephemeral: true }); // Don't need deferred here

	let member = (element.guild) ? element.guild.members.cache.get(user.id) : undefined;

	if(args[0]){
		user = await grabUser(client, args[0]) as User;
		if(!user) return element.reply("I couldn't find that user.");

		member = element.guild?.members.cache.get(user.id);
	}
	// Date the account was created
	const joinTime = new Date(user.createdTimestamp).toDateString().slice(4);

	// Time since the user account was created
	let joinTimeAgo = humanTime(Date.now() - user.createdTimestamp, "\\Y years, \\M months, \\D days");
	if(joinTimeAgo.startsWith("0 years, ")) joinTimeAgo = joinTimeAgo.replace("0 years, ", "");
	if(joinTimeAgo.startsWith("0 months, ")) joinTimeAgo = joinTimeAgo.replace("0 months, ", "");

	// Time after discord launched (13th May, 2015)
	const DISCORD_LAUNCH_UNIX = 1431475200000;
	let daysAfterLaunch = humanTime(user.createdTimestamp - DISCORD_LAUNCH_UNIX, "\\Y years, \\M months, \\D days");
	if(daysAfterLaunch.startsWith("0 years, ")) daysAfterLaunch = daysAfterLaunch.replace("0 years, ", "");
	if(daysAfterLaunch.startsWith("0 months, ")) daysAfterLaunch = daysAfterLaunch.replace("0 months, ", "");

	let embedColor = 14487568;
	let displayName = user.username;

	let statusEmbed = { name: "Status:", value: "Unknown", inline: true };
	let playingEmbed = { name: "Playing:", value: "Nothing", inline: true };
	let roleEmbed = { name: "Roles:", value: "N/A", inline: false };

	if(member){
		displayName = member.displayName;
		if(member.presence){

			const title = caseFix(member.presence.status);
			statusEmbed = { name: "Status:", value: title, inline: true };

			for(const activity of member.presence.activities){
				if(activity.type !== 0) continue;

				playingEmbed = { name: "Playing:", value: activity.name, inline: true };
				break;
			}
		}

		if(member.roles){
			const sortFunction = function(a: Role, b: Role) {
				return a.position - b.position;
			};
			const r = [...member.roles.cache.values()].sort(sortFunction).slice(1).reverse().join(", ");
			roleEmbed = { name: "Roles:", value: `\u200b${r}`, inline: false };
		}

		if(member.roles?.highest?.color) embedColor = member.roles.highest.color;
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: displayName })
		.setThumbnail(user.displayAvatarURL())
		.setTimestamp()
		.setFooter({ text: clientUser.username, iconURL: clientUser.displayAvatarURL() });


	let discrim = user.discriminator;
	if(!user.discriminator || user.discriminator === "#0") discrim = "N/A";
	const embedFields = [
		{ name: "Username:", value: user.username, inline: true },
		{ name: "Discrim:", value: discrim, inline: true },
		{ name: "Discord ID:", value: user.id, inline: true },
		{ name: "Is bot?", value: caseFix(user.bot.toString()), inline: true },
		statusEmbed,
		playingEmbed,
		{ name: "Joined Discord:", value: `${joinTime}, *OR*\n${joinTimeAgo} ago, *OR*\n${daysAfterLaunch} after launch`, inline: false },
		roleEmbed
	];

	embed.setColor(embedColor);
	embed.addFields(embedFields);
	return await handleElement(element, isSlashCommand, { embeds: [embed], ephemeral: false });
}

const info: CommandInfo = {
	name: "info",
	altNames: ["info"],
	description: "Gives information about a user",
	usage: "info {user}",
	enabled: true,
	dmCompatible: true,
	permLevel: 0,
	category: "misc"
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
				.addUserOption(option => option.setRequired(false).setName("user").setDescription("The user to get information about"))
		};
	}

	return {
		execute: async function execute(interaction: ChatInputCommandInteraction) {
			const args = [];

			const user = interaction.options.getUser("user");
			if(user) args.push(user.id);

			await run(client, interaction, args);
		}
	};
}

export { run, slash, info };