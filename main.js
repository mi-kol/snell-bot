const { Client, Intents, MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
Canvas.registerFont('./assets/snellify/Anton-Regular.ttf', { family: 'Anton' })
require('dotenv').config();

const client = new Client({ intents: [ Intents.FLAGS.GUILDS ]});

const grInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const quips = [
    'Hitting 51 straight free throws...',
    'Making a 3-pointer buzzer beater...',
    'Joining the 50/50/100 club...',
    'Saving the Atlanta Hawks...',
    'Solo carrying the Pelicans...'
]

client.once('ready', () => {
    console.log('Ready!');
})

client.on('interactionCreate',  async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('PONG');
    } else if (commandName === 'user') {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`)
    } else if (commandName === 'snellify') {
        const loadingGif = new MessageAttachment(`https://snell.mikol.dev/snell${grInt(1, 2)}.gif`)
        await interaction.reply({ content: quips[grInt(0, quips.length - 1)], files: [loadingGif], ephemeral: true})
        
        let canvReady = await snellify(interaction.options.data)
        const attachment = new MessageAttachment(canvReady.toBuffer(), 'snelled.png');

        await interaction.followUp({ files: [attachment], ephemeral: false })
    }
})

const snellify = async (data) => {
    ({ value: header } = data.find(elm => elm.name === 'name'));
    ({ value: subheader } = data.find(elm => elm.name === 'subtitle'));

    let stats = data.reduce(
        (accum, curr) => {
            if (!curr.name.startsWith('stat')) return accum;
            let { name, value } = curr;
            return {...accum, [name]: value }
        },
        {}
    )

    const canvas = Canvas.createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/snellify/snell_base.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = '96px "Anton"';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(header, 20, 20, 300);
    ctx.textBaseline = 'top';

    ctx.fillText(subheader, 20, 132, 200);
    
    let statI = 240
    for (const [_, value] of Object.entries(stats)) {
        let parsed = value.split(' ');
        let num = parsed[0]
        let txt = parsed.slice(1)
        ctx.fillText(num, 20, statI);
        ctx.font = '32px "Anton"';
        ctx.fillText(txt, 60, statI + 40);
        ctx.font = '96px "Anton"';
        statI += 108;
    }

    return canvas;
}

client.login(process.env.DISCORD_TOKEN)