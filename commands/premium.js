const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();
const generated = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Stokta varsa belirtilen bir hizmeti oluştur")
    .addStringOption((option) =>
      option
        .setName("service")
        .setDescription("Oluşturulacak hizmetin adı")
        .setRequired(true),
    ),

  async execute(interaction) {
    const service = interaction.options.getString("service");
    const member = interaction.member;

    // Check if the channel where the command was used is the generator channel
    if (interaction.channelId !== config.premiumChannel) {
      const wrongChannelEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Wrong command usage!")
        .setDescription(
          `You cannot use the \`/premium\` Bu kanalda bu komutu kullanma! Şunu deneyin <#${config.premiumChannel}>!`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [wrongChannelEmbed],
        ephemeral: true,
      });
    }

    // Check if the user has cooldown on the command
    if (generated.has(member.id)) {
      const cooldownEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Cooldown!")
        .setDescription(
          `Lütfen bu komutu tekrar çalıştırmadan önce **${config.premiumCooldown}** saniye bekleyin!"`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // File path to find the given service
    const filePath = `${__dirname}/../premium/${service}.txt`;

    // Read the service file
    fs.readFile(filePath, "utf-8", (error, data) => {
      if (error) {
        const notFoundEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("Generator error!")
          .setDescription(`Service \`${service}\` mevcut değil!`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      const lines = data.split(/\r?\n/);

      if (lines.length <= 1) {
        const emptyServiceEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("Generator error!")
          .setDescription(`The \`${service}\` Hizmet boş!"`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({
          embeds: [emptyServiceEmbed],
          ephemeral: true,
        });
      }

      const generatedAccount = lines[0];

      // Remove the redeemed account line
      lines.shift();
      const updatedData = lines.join("\n");

      // Write the updated data back to the file
      fs.writeFile(filePath, updatedData, (writeError) => {
        if (writeError) {
          log.error(writeError);
          return interaction.reply("Hesap kullanılırken bir hata oluştu");
        }

        const embedMessage = new MessageEmbed()
          .setColor(config.color.green)
          .setTitle("Premium hesap oluşturuldu")
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setDescription(
            "🙏 Premium üye olduğunuz için çok teşekkür ederiz! \n 🌟 Desteğiniz bizim için çok değerli! 💖😊",
          )
          .addField(
            "Service",
            `\`\`\`${service[0].toUpperCase()}${service
              .slice(1)
              .toLowerCase()}\`\`\``,
            true,
          )
          .addField("Account", `\`\`\`${generatedAccount}\`\`\``, true)
          .setImage(config.banner)
          .setTimestamp();

        member
          .send({ embeds: [embedMessage] })
          .catch((error) =>
            console.error(`Gömülü mesaj gönderirken hata oluştu: ${error}`),
          );
        interaction.reply({
          content: `**DM'nizi kontrol edin**, ${member}! Eğer mesajı alamazsanız, lütfen özel iletiyi açın!`,
        });

        generated.add(member.id);
        setTimeout(() => {
          generated.delete(member.id);
        }, config.premiumCooldown * 1000);
      });
    });
  },
};
