const { Client, Intents, MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const wait = require('node:timers/promises').setTimeout;
Canvas.registerFont('./assets/snellify/Anton-Regular.ttf', { family: 'Anton' })
require('dotenv').config();

const fetch = require('cross-fetch');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS ]});

const grInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const quips = [
    'Hitting 51 straight free throws...',
    'Making a 3-pointer buzzer beater...',
    'Joining the 50/50/100 club...',
    'Saving the Atlanta Hawks...',
    'Solo carrying the Pelicans...'
]

const introductionQuips = [
    '0-time Hall of Famer',
    'Summer League MVP',
    'free throw legend',
    'New Orleans Pelican',
    'basketball player(?)',
    '-',
    'robotic',
    'the trapped soul of'
]

let snellUsageStats = 0;

client.once('ready', async () => {
    console.log('Ready!');

    // let canvReady = await snellify([
    //     { name: 'name', value: 'twinnee'},
    //     { name: 'subtitle', value: '5/2/21 on split'},
    //     { name: 'stat1', value: '0 dmg/round'},
    //     { name: 'stat2', value: '0 bitches'},
    //     { name: 'stat3', value: '0 value'},
    //     { name: 'stat4', value: '17 deaths'},
    //     { name: 'stat5', value: '3 kills'}
    // ])
    // const attachment = new MessageAttachment(canvReady.toBuffer(), 'snellllll.png');
    // client.channels.cache.get('360490423044800514').send({
    //     files: [attachment],
    //     content: 'test'
    // })
})

client.on('interactionCreate',  async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (interaction.user.id === '818642728287207435') { interaction.reply('SHUT THE FUCK UP NERD!!!')}

    if (commandName === 'alive') {
        await interaction.reply('PONG');
    } else if (commandName === 'snellify') {
        await interaction.deferReply();
        try {
            const loadingGif = new MessageAttachment(`./assets/loading/snell${grInt(1, 6)}.gif`)
            await interaction.editReply({ content: quips[grInt(0, quips.length - 1)], files: [loadingGif], ephemeral: true})
            
            let canvReady = await snellify(interaction.options.data)
            const attachment = new MessageAttachment(canvReady.toBuffer(), `${interaction.options.getString('name')}_snelled.png`);

            // `Hey, it's me; ${introductionQuips[grInt(0, introductionQuips.length - 1)]} Tony Snell. Here's the source for this image: \`\`\`${interaction.options.data.reduce((accumulator, curr) => accumulator + ` ${curr.name}: ${curr.value}`, '/snellify')} \`\`\` `
            
            await wait(2500);
            
            await interaction.editReply({ files: [attachment], ephemeral: false, content: '_ _'});

            snellUsageStats++;

            let yr = 2013 + grInt(0, 8)

            fetch(`https://www.balldontlie.io/api/v1/season_averages?season=${yr}&player_ids[]=426`).then(rsp => rsp.json()).then(json => client.user.setActivity(snellTriviaHandler(json['data'][0], yr)))
        } catch {
            await interaction.editReply({ content: 'i bet it felt good to fuck up the bot huh. Now u gotta ping mex' })
        }
    } else if (commandName === 'usagestats') {
        await interaction.reply(`Been used ${snellUsageStats} times since last restart.`)
    }
})

const snellTriviaHandler = (data, year) => {
    let dataArray = Object.entries(data)
    let templ = {
        verb: '',
        suffix: '',
        pct: false,
        default: false
    }
    const randomStat = dataArray[grInt(0, dataArray.length - 1)]
    switch (randomStat[0]) {
        default:
        case 'games_played':
            templ = { verb: 'played', suffix: 'games', default: true }
            break;
        case 'min':
            templ = { verb: 'played', suffix: 'minutes per game'}
            break;
        case 'fga':
            templ = { verb: 'made', suffix: 'field goals per game'}
            break;
        case 'fgm':
            templ = { verb: 'attempted', suffix: 'field goals per game' }
            break;
        case 'fg3m':
            templ = { verb: 'made', suffix: '3s per game'}
            break;
        case 'fg3a':
            templ = { verb: 'attempted', suffix: 'field goals per game'}
            break;
        case 'ftm':
            temp1 = { verb: 'made', suffix: 'free throws per game'}
            break;
        case 'fta':
            temp1 = { verb: 'attempted', suffix: 'free throws per game'}
            break;
        case 'oreb':
            temp1 = { verb: 'picked up', suffix: 'offensive rebounds per game'}
            break;
        case 'dreb':
            templ = { verb: 'picked up', suffix: 'defense rebounds per game'}
            break;
        case 'reb':
            templ = { verb: 'picked up', suffix: 'rebounds per game'}
            break;
        case 'pts':
            templ = { verb: 'put up', suffix: 'points per game'}
            break;
        case 'ft_pct':
            templ = { verb: 'kept a', suffix: 'free throw percentage', pct: true}
            break;
    } 

    let statData = templ.pct ? `${parseFloat(randomStat[1]) * 100}%` : randomStat[1]

    return `In ${year}, Snell ${templ.verb} ${templ.default ? data['games_played'] : statData} ${templ.suffix}.`
}

const snellify = async (data) => {
    ({ value: header } = data.find(elm => elm.name === 'name'));
    ({ value: subheader } = data.find(elm => elm.name === 'subtitle'));

    let stats = data.reduce(
        (accum, curr) => {
            if (!curr.name.startsWith('stat')) return accum;
            let { name, value } = curr;
            return {...accum, [name]: value.toUpperCase() }
        },
        {}
    )

    const canvas = Canvas.createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/snellify/snell_base.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    let headerFontData = findTextFontData(ctx, header.toUpperCase(), 290, 20, 20);
    console.log(headerFontData)
    ctx.font = `${headerFontData.size}px "Anton"`
    ctx.fillText(header.toUpperCase(), headerFontData.leftOffset, headerFontData.topOffset);

    let subheaderFontData = findTextFontData(ctx, subheader.toUpperCase(), 170, headerFontData.bottomBoundingBox + 10, 20 + headerFontData.cheatLeft, Math.round(headerFontData.size * 0.6))
    console.log(subheaderFontData)
    ctx.font = `${subheaderFontData.size}px "Anton"`
    ctx.fillText(subheader.toUpperCase(), subheaderFontData.leftOffset, subheaderFontData.topOffset)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.beginPath();
    ctx.moveTo(20 + headerFontData.cheatLeft, subheaderFontData.bottomBoundingBox + 10)
    ctx.lineTo(subheaderFontData.width + subheaderFontData.leftOffset, subheaderFontData.bottomBoundingBox + 10)
    ctx.stroke();
    
    let statEnd = 450;
    console.log(Object.entries(stats))
    let statEntries = Object.entries(stats).sort((a, b) => a[1].split(' ')[0] - b[1].split(' ')[0]); // 3
    console.log(statEntries);

    let timeEntry = -1;
    timeEntry = statEntries.findIndex(val => 
        {
            let tgt = val[1].split(' ')
            if (tgt.length > 1) {
                return ['MINS', 'MIN', 'MINUTES', 'MINUTE', 'HOURS', 'HOUR'].includes(tgt[1].toUpperCase())
            } else {
                return false;
            }
        }
    )

    if (timeEntry !== -1) {
        statEntries.push(statEntries.splice(timeEntry, 1)[0]);
    }
    let padSpacePerLine = 15 / statEntries.length;
    let statBegin = subheaderFontData.bottomBoundingBox + 35 + padSpacePerLine
    let padSpace = (statEntries.length - 1) * padSpacePerLine;

    let heightPerStatLine = (statEnd - statBegin) / statEntries.length

    ctx.font = `${heightPerStatLine}px "Anton"`
    ctx.textBaseline = 'bottom'
    statBegin += heightPerStatLine;

    let heightPixelTracker = statBegin;

    // console.log(`${statBegin} - ${statEnd}:: ${statEntries} (and ${padSpace}) yields ${heightPerStatLine}`)

    for (const [_, value] of statEntries) {
        let parsed = value.split(' ');
        let num = parsed[0];
        let txt = parsed.slice(1).join(' ');

        let numberPlacement = {x: 20 + headerFontData.cheatLeft, y: heightPixelTracker}

        ctx.font = `${Math.min(heightPerStatLine, headerFontData.size * 1.4)}px "Anton"`;
        let numberBBD = ctx.measureText(num)
        // console.log(numberBBD);
        ctx.fillText(num, numberPlacement.x, numberPlacement.y);
        ctx.font = `${Math.min(heightPerStatLine * 0.4, subheaderFontData.size * 1.1)}px "Anton"`;
        let txtBBD = ctx.measureText(txt)
        let diffBBD = Math.abs(numberBBD.actualBoundingBoxDescent - txtBBD.actualBoundingBoxDescent);
        // let diffABline = Math.abs(numberBBD.alphabeticBaseline - txtBBD.alphabeticBaseline)

        let textPlacement = {x: numberPlacement.x + numberBBD.width + 8, y: heightPixelTracker}
        // console.log(txtBBD)

        ctx.fillText(txt, textPlacement.x, textPlacement.y - diffBBD - (txtBBD.alphabeticBaseline + txtBBD.actualBoundingBoxDescent));

        heightPixelTracker += (heightPerStatLine + padSpace);

        // console.log(`drew to ${numberPlacement.x}, ${numberPlacement.y} && ${textPlacement.x}, ${textPlacement.y}`)
    }

    return canvas;
}

const findTextFontData = (context, str, targetWidth, targetTopOffset, targetLeftOffset, startFont = 100) => {
    let currentFont = startFont;
    context.font = `${currentFont}px "Anton"`
    let width = context.measureText(str).width;
    while (width > targetWidth) {
        context.font = `${--currentFont}px "Anton"`
        width = context.measureText(str).width;
    }

    while (width < targetWidth) {
        currentFont += 0.1;
        context.font = `${currentFont}px "Anton"`;
        width = context.measureText(str).width;
        // console.log(currentFont)
        if (width > targetWidth) {
            currentFont -= 0.1;
            context.font = `${currentFont}px "Anton"`;
            // console.log(`yup ${currentFont}`)
            break;
        }
    }

    let final = context.measureText(str);
    // console.log(final)
    // console.log(`topOffset: ${targetTopOffset} + ${final.actualBoundingBoxAscent}`)

    return {
        size: currentFont,
        topOffset: targetTopOffset + final.actualBoundingBoxAscent,
        leftOffset: targetLeftOffset + final.actualBoundingBoxLeft,
        bottomBoundingBox: targetTopOffset + final.actualBoundingBoxAscent + Math.round(final.actualBoundingBoxDescent),
        width: final.width,
        cheatLeft: 5
    }
}

client.login(process.env.DISCORD_TOKEN)