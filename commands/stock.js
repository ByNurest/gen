const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs").promises;
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stok")
    .setDescription("Hizmet stokunu görüntüle"),

  async execute(interaction) {
    const freeStock = await getStock(`${__dirname}/../free/`);
    const premiumStock = await getStock(`${__dirname}/../premium/`);

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle(`${interaction.guild.name} Stok Bilgisi`)
      .setDescription(
        ` **${interaction.guild.name}** **/ücretsiz - /premium Komutunu Kullanarak Hesap Alabilirsin**`,
      )
      .setFooter(config.footer)
      .setImage(config.banner);

    if (freeStock.length > 0) {
      const freeStockInfo = await getServiceInfo(
        `${__dirname}/../free/`,
        freeStock,
      );
      embed.addField("Ücretsiz Servisler", freeStockInfo, true);
    }

    if (premiumStock.length > 0) {
      const premiumStockInfo = await getServiceInfo(
        `${__dirname}/../premium/`,
        premiumStock,
      );
      embed.addField("Vip Servisler", premiumStockInfo, true);
    }

    interaction.reply({ embeds: [embed] });
  },
};

async function getStock(directory) {
  try {
    const files = await fs.readdir(directory);

    const stok = files.filter((file) => file.endsWith(".txt"));
    return stok;
  } catch (err) {
    console.error("Unable to scan directory: " + err);
    return [];
  }
}

async function getServiceInfo(directory, stok) {
  const info = [];
  for (const service of stok) {
    const serviceContent = await fs.readFile(
      `${directory}/${service}`,
      "utf-8",
    );
    const lines = serviceContent.split(/\r?\n/);
    info.push(`**${service.replace(".txt", "")}:** \`${lines.length}\``);
  }
  return info.join("\n");
}
