import cron from "node-cron";

// import dailyWeather from "./dailyWeather.js";
import updateGuildMembers from "./updateGuildMembers.js";


async function cronEvents(client){
	cron.schedule("0 0-15 * * 2-6", async () => {
		await updateGuildMembers(client);
	});
}


export default cronEvents;
