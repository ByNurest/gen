const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const stok = require("./stock");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Komut listesini gösterir."),

  async execute(interaction) {
    const { commands } = interaction.client;

    const komutListesiGomulu = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle("Yardım Paneli")
      .setDescription(
        `👋 Merhaba ve hoş geldiniz **${interaction.guild.name}**! 🌟 Size en iyi hizmeti sunmak için buradayız. 🚀`,
      )
      .setImage(config.banner)
      .setThumbnail(
        interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }),
      ) // Botun avatarını thumbnail olarak ayarla
      .addFields({
        name: `Komutlar`,
        value:
          "`/yardım`   **Yardım komutunu görüntüler**\n`/oluştur` **Yeni bir hizmet oluşturur**\n`/ücretsiz`   **Ödül oluşturur**\n`/ekle`    **Stoğa ödül ekler**\n`/stok`  **Mevcut stoku görüntüler**\n`/premium` **Premium ödül oluşturur**",
      })
      .setFooter(
        interaction.user.tag,
        interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
      )
      .setTimestamp();

    await interaction.reply({ embeds: [komutListesiGomulu] });
  },
};
