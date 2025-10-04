import { SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, Client } from "discord.js";

async function _execute(_interaction: ChatInputCommandInteraction): Promise<void> { // eslint-disable-line
	return;
}


export interface Config {
	prefix: string;
	ownerID: string;
	token: string;
	timezone: string;
}

export interface SlashData {
	data: SlashCommandOptionsOnlyBuilder
}

export interface ExecuteData {
	execute: typeof _execute
}

export interface CommandInfo {
	name: string;
	altNames: string[];
	description: string;
	usage: string;
	enabled: boolean;
	dmCompatible: boolean;
	permLevel: number;
	category: string;
	fileName?: string;
}

export type Command = typeof import("../commands/help.js");



// Classes
export class DiscordClient extends Client {
	config?: Config;
	commands: Map<string, Command> = new Map();
	altNames: Map<string, string> = new Map();
	slashCommands: Command[] = [];
}