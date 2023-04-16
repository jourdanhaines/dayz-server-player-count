const Discord = require("discord.js");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const ip = `${process.env.GAME_SERVER_IP}:${process.env.GAME_SERVER_QUERY_PORT}`;
const apiUrl = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${process.env.STEAM_API_KEY}&filter=addr\\${ip}`;

const client = new Discord.Client({
    intents: Discord.Intents.FLAGS.GUILDS,
});

async function getMemberCount() {
    try {
        const data = await fetch(apiUrl);

        try {
            const json = await data.json();

            try {
                client.user?.setActivity(
                    `${json.response.servers[0].players}/${
                        json.response.servers[0].max_players
                    } (${json.response.servers[0].gametype.split(",")[9]})`,
                    { type: "PLAYING" }
                );

                console.log(
                    `${json.response.servers[0].players}/${
                        json.response.servers[0].max_players
                    } (${json.response.servers[0].gametype.split(",")[9]})`
                );
            } catch (e) {
                client.user?.setActivity("Server unreachable", {
                    type: "WATCHING",
                });
                console.log("Server unreachable...");
            }

            const guilds = client.guilds.cache.get(
                process.env.DISCORD_GUILD_ID
            );
            const member = guilds.members.cache.get(guilds.me.id);
            await member.setNickname(process.env.DAYZ_SERVER_NAME);
        } catch (error) {
            console.log("Invalid JSON");
            console.log(data);
        }
    } catch (error) {
        console.log("Failed to fetch");
        console.error(error);
    }
}

client.on("ready", () => {
    console.log("Bot logged in");

    getMemberCount();
    setInterval(getMemberCount, 10000);
});

client
    .login(process.env.DISCORD_CLIENT_SECRET)
    .catch((err) => console.error(err));
