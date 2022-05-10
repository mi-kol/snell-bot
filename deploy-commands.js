const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commands = [
    // new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
    // new SlashCommandBuilder().setName('snellify').setDescription('Creates a Snell meme, given a string delimited by dashes. Requires at least 4 words (Name, subtitle, x (number), y (statistic)). Ex: /snellify twinnee-5/9/21 at Split-0-kills')
    new SlashCommandBuilder().setName('snellify').setDescription('Snellifies.')
        .addStringOption(opt => opt.setName('name').setDescription('Enter the name of the subject. (e.g. Tony Snell)').setRequired(true))
        .addStringOption(opt => opt.setName('subtitle').setDescription('Enter the subtitle. (e.g. 2/7/21 at Jazz)').setRequired(true))
        .addStringOption(opt => opt.setName('stat1').setDescription('Enter the first stat line, delimited by a space. First section should be a number. (e.g. 0 rbs)').setRequired(true))
        .addStringOption(opt => opt.setName('stat2').setDescription('Enter a stat line, delimited by a space. First section should be a number.'))
        .addStringOption(opt => opt.setName('stat3').setDescription('Enter a stat line, delimited by a space. First section should be a number.'))
        .addStringOption(opt => opt.setName('stat4').setDescription('Enter a stat line, delimited by a space. First section should be a number.'))
        .addStringOption(opt => opt.setName('stat5').setDescription('Enter a stat line, delimited by a space. First section should be a number.'))
        .addStringOption(opt => opt.setName('stat6').setDescription('Enter a stat line, delimited by a space. First section should be a number.'))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log('Registered cmds'))
    .catch(console.error)

