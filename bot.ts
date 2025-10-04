import fs from "fs";
import { GatewayIntentBits, Partials, MessageMentionOptions } from "discord.js";
import colors from "colors";
import { output } from "./src/functions.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import dotenv from "dotenv";
import { Config, SlashData, Command, DiscordClient } from "./types/typings.js";

// We set the instances's timezone to UTC+0 cause we're not fucking morons
// You should ALWAYS be set to UTC+0. If you don't, you're a shitty developer.
process.env.TZ = "Etc/UTC";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if(!process.env.token) throw new Error("No token was supplied. please supply a token and restart.");
if(!process.env.timezone) throw new Error("No Timezone was supplied. Please supply a timezone and restart.");
if(new Date().getTimezoneOffset() !== 0) throw new Error("Your device is set up incorrectly. Please change your devices timezone to UTC+0");


// Load the config
const config: Config = {
	prefix: process.env.prefix || "!", // Default config
	ownerID: process.env.ownerID || "1", // Sets to Clyde if not specified
	token: process.env.token,
	timezone: process.env.timezone
};


console.log(`Setting prefix to ${config.prefix}`);
console.log(`Setting ownerID to ${config.ownerID}`);
console.log(`Setting logs timezone to ${config.timezone}`);

// Handle the unhandled things
process.on("uncaughtException", (err) => {
	const errorMsg = err?.stack?.replace(new RegExp(`${__dirname}/`, "g"), "./");
	console.error(`Uncaught Exception: ${errorMsg}`);
});

process.on("unhandledRejection", (err) => {
	console.error(`Unhandled rejection: ${err}`);
	process.exit(1); // Hopefully fixes EAI_Again?
});

console.log("Starting Bot...");

const intentFlags = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildExpressions,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageReactions,
	GatewayIntentBits.MessageContent
];

// const allowedMentions = Discord
const allowedMentions = { parse: ["users", "roles"], repliedUser: true, roles: [], users: [] } as MessageMentionOptions;

const client = new DiscordClient({
	allowedMentions: allowedMentions,
	intents: intentFlags,
	partials: [Partials.Message]
});

client.config = config;

/**
 * @name main
 * @description Starts the discord bot
**/
const main = async () => {
	// Load the events
	output(client, "misc", "Loading events...");

	// Find the event with the longest name
	const eventList = fs.readdirSync(`./build/events`).filter(file => file.endsWith(".js")).sort((a, b) => a.length - b.length);
	let longestName = eventList[eventList.length - 1].length - 3;

	for(const file of eventList){
		try {
			// Try loading the event file
			const event = await import(`./events/${file}`);

			if(!event.info.enabled) continue;

			// Add the event to the event listener
			client.on(event.info.name, event.run.bind(null, client));

			const paddedName = event.info.name.padEnd(longestName, " ");
			output(client, "good", `Loaded event: ${paddedName}  > ${event.info.description}`);

			// delete require.cache[require.resolve(`./events/${file}`)];

		} catch (err){
			// Warn if the event failed to load
			output(client, "warn", `Failed to load event: ${file}!`);
			output(client, "error", err);
		}
	}


	// Load the commands
	output(client, "misc", "Loading commands...");

	// Find the command with the longest name
	const commandList = fs.readdirSync(`./build/commands`).filter(file => file.endsWith(".js") || file.endsWith(".cjs")).sort((a, b) => a.length - b.length);
	longestName = commandList[commandList.length - 1].length - 3;

	for(const file of commandList){
		try {
			// Try loading the command file
			const command: Command = await import(`./commands/${file}`);

			// Set the command file name for reloading later
			command.info.fileName = file;

			// Set the command name and aliases
			client.commands.set(command.info.name, command);
			command.info.altNames.forEach(alias => client.altNames.set(alias, command.info.name));
			// If the command is a slash command
			const clientSlash = command.slash(client, false) as SlashData;
			if(clientSlash?.data && command.info.enabled) client.slashCommands.push(command);

			const paddedName = command.info.name.padEnd(longestName, " ");
			const disableString = command.info.enabled ? "" : ` ${colors.red("(disabled)")}`;
			output(client, "good", `Loaded command: ${paddedName}  > ${command.info.description}${disableString}`);

		} catch (err){
			// Warn if the command failed to load
			output(client, "warn", `Failed to load command: ${file}!\n${err}`);
		}
	}

	await client.login(client.config?.token);
	// cronEvents(client);
};

main();