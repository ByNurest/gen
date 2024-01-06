const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token, globalDeploy } = require("./config.json");

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

console.log("Loading commands...");

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());

  // Print a fancy message for each loaded command
  console.log(`✅ Loaded command: ${command.data.name}`);
}

const rest = new REST({ version: "9" }).setToken(process.env.token || token);

(async () => {
  try {
    if (globalDeploy) {
      // Deploy commands globally
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log("\n✅ Successfully registered global application commands.");
    } else {
      // Deploy commands to a specific guild
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
  body: commands,
});

      console.log("\n✅ Successfully registered guild-specific application commands.");
    }
  } catch (error) {
    console.error(error);
  }
})();
