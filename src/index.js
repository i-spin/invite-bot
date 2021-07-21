/* eslint-disable no-console */
const Discord = require('discord.js');

const fetch = require('node-fetch');

const client = new Discord.Client();

const randomWords = require('random-words');

const utils = require('./utils');

const {
  clientID,
  botToken,
  callbackURL,
  githubToken,
} = require("../config.json");

// <String, ExecuteStatus>
const verifyingUser = new Map();

// async function generateInvite(guildID, channelID) {
//  const link = await client.guilds.cache
//    .get(guildID)
//    .channels.cache.get(channelID)
//    .createInvite({ maxUses: 1, maxAge: 600000 });
//  return link;
// }

client.on('message', (message) => {
  if (message.author.bot) {
    return null;
  }
  if (message.content.startsWith(';geninvite')) {
    const args = message.content.split(' ');
    const randomPassphrase = randomWords(6).join(' ');
    try {
      client.users.cache.get(args[1]).send(
        new Discord.MessageEmbed()
          .setTitle(`${message.author.username}#${message.author.discriminator} has invited you to a server! Please verify yourself first:`)
          .setImage(message.author.avatarURL)
          .addField('How to Verify Discord:', `Click this [link](https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURI(callbackURL)}&response_type=token&scope=identify%20connections) to verify your github connection.`)
          .addField('How to Verify Github:', `Please make a public gist named \`InvitebotPassphrase\`, with the following content: \`${randomPassphrase}\`, and send \`done\`.`)
          .addField('Extra Information', 'Please verify your discord first, so we can get your github username!'),
      );
      verifyingUser.set(args[1],
        new utils.ExecuteStatus(args[1], randomPassphrase, message.guild.id, message.channel.id));
    } catch (e) {
      message.reply('I cannot start a DM with the specified user! _This user have to be in the same server as me, and they must have their DM enabled._');
    }
  }
  return '';
});

client.on('message', (message) => {
  if (message.channel instanceof Discord.DMChannel
    && verifyingUser.has(message.author.id.toString())) {
    // TODO: A reaction would be better
    if (message.content.toLowerCase() === 'done') {
      fetch(`https://api.github.com/users/${verifyingUser.get(message.author.id).githubName}/gists`, {
        headers: {
          authorization: `token ${githubToken}`,
        },
      }).then((result) => {
        result.json().then((data) => {
          message.channel.send(data[0].files.InvitebotPassphrase.raw_url);
        //   fetch(data[0].files.InvitebotPassphrase.raw_url, {
        //     headers: {
        //       authorization: `token ${githubToken}`,
        //     },
        //   }).then((realresult) => {
        //     message.channel.send(realresult.toString());
        //     message.channel.send(verifyingUser.get(message.author.id.toString()).passphrase);
        //   });
        });
      });
      message.channel.send(utils.errorEmbed('Verification Failed! Reason: **Cannot find Gist!**'));
      return 'Verification Failed';
    }

    try {
      if (verifyingUser.get(message.author.id).discordVerified) {
        return 'Already Verified';
      }
      fetch('https://discord.com/api/users/@me/connections', {
        headers: {
          authorization: `Bearer ${message.content.trim()}`,
        },
      }).then((result) => {
        result.json().then((data) => {
          data.forEach((element) => {
            if (element.type === 'github') {
              verifyingUser.get(message.author.id).githubName = element.name;
              verifyingUser.get(message.author.id).discordVerified = true;
              message.channel.send(utils.successEmbed(`Discord's Github connection is verified as: ${verifyingUser.get(message.author.id).githubName}`));
            }
          });
        });
      });
    } catch (e) {
      message.channel.send(utils.errorEmbed(e.toString()));
      return 'Verification Failed';
    }
  }
  return 'Done';
});

client.login(botToken);
