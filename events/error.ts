import { output } from "../src/functions.js";
import { DiscordClient } from "../types/typings.js";


async function run(client: DiscordClient, error: unknown) {
	output(client, "error", `${error}`);
}


const info = {
	name: "error",
	description: "Emitted when the client encounters an error",
	enabled: true
};


export { run, info };