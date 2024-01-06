const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const os = require("os");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ekle")
    .setDescription("Bir hizmete hesap ekleyin.")
    .addStringOption((option) =>
      option
        .setName("tip")
        .setDescription("Hizmetin tipi (ücretsiz veya premium)")
        .setRequired(true)
        .addChoices(
          { name: "Ücretsiz", value: "free" },
          { name: "Premium", value: "premium" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("hizmet")
        .setDescription("Hesabın eklenmesi gereken hizmet")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("hesap")
        .setDescription("Eklenmesi gereken hesap")
        .setRequired(true),
    ),

  async execute(interaction) {
    const hizmet = interaction.options.getString("hizmet");
    const hesap = interaction.options.getString("hesap");
    const tip = interaction.options.getString("tip");

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      const hataGomulu = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("İzniniz Yok!")
        .setDescription("🛑 Yalnızca Yönetici bu işlemi gerçekleştirebilir.")
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({ embeds: [hataGomulu], ephemeral: true });
    }

    if (!hizmet || !hesap || (tip !== "free" && tip !== "premium")) {
      const eksikParametreGomulu = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Eksik parametreler veya geçersiz tip!")
        .setDescription(
          "Bir hizmet, bir hesap ve geçerli bir tip (ücretsiz veya premium) belirtmelisiniz!",
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({
        embeds: [eksikParametreGomulu],
        ephemeral: true,
      });
    }

    let dosyaYolu;
    if (tip === "free") {
      dosyaYolu = `${__dirname}/../free/${hizmet}.txt`;
    } else if (tip === "premium") {
      dosyaYolu = `${__dirname}/../premium/${hizmet}.txt`;
    }

    fs.appendFile(dosyaYolu, `${os.EOL}${hesap}`, function (hata) {
      if (hata) {
        log.error(hata);
        return interaction.reply("Hesap eklenirken bir hata oluştu.");
      }

      const basariGomulu = new MessageEmbed()
        .setColor(config.color.green)
        .setTitle("Hesap eklendi!")
        .setDescription(
          `Başarıyla \`${hesap}\` hesabı \`${hizmet}\` hizmetine **${tip}** olarak eklendi.`,
        )
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [basariGomulu], ephemeral: true });
    });
  },
};
