/* eslint-disable no-unused-vars */
const Discord = require('discord.js');

const fetch = require('node-fetch');

function successEmbed(message) {
  return new Discord.MessageEmbed()
    .setColor('GREEN')
    .setTitle('Success!')
    .setDescription(message);
}

function errorEmbed(message) {
  return new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle('Error!')
    .setDescription(message);
}

class ExecuteStatus {
  constructor(id, passphrase, inviteGuild, inviteChannel) {
    this.id = id;
    this.githubName = '';
    this.discordVerified = false;
    this.passphrase = passphrase;
    this.inviteGuild = inviteGuild;
    this.inviteChannel = inviteChannel;
  }
}

exports.errorEmbed = errorEmbed;
exports.ExecuteStatus = ExecuteStatus;
exports.successEmbed = successEmbed;
