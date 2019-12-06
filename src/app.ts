import { Client, TextChannel, RichEmbed, User } from 'discord.js'
import { config as configEnv } from 'dotenv'

configEnv()
const client = new Client()

client.on('ready', () => console.log('I woke up'))
 
//const URL_REGEX = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
const PREFIX = '%'

async function getSolutions(channel: TextChannel, day: number, author: User){

  const messages = await channel.fetchMessages()
  const solutions = messages.filter(m => m.content.includes(`Day: ${day}`))

  const solutionsData = solutions.map(m => {
    const lines = m.content.split('\n')

    const golfLine = lines.find(line => line.toLowerCase().includes('golf'))
    const noGolf = lines.filter(line => !line.toLowerCase().includes('golf')).join('\n')

    // I don't know if we should use regex or just checking for http is ok
    // const golfLinks = golfLine ? golfLine.split(/\s+/).filter(word => URL_REGEX.test(word)) : undefined
    // const normalLinks = noGolf.split(/\s+/).filter(word => URL_REGEX.test(word))

    const golfLinks = golfLine ? golfLine.split(/\s+/).filter(word => word.includes('http')) : undefined
    const normalLinks = noGolf.split(/\s+/).filter(word => word.includes('http'))

    return {author: `${m.author.username}#${m.author.discriminator}`, links: normalLinks, golfLinks}
  })

  solutionsData.forEach(s => {
    const embed = new RichEmbed()
      .addField('Author', s.author)
      .addField('Links', s.links)
    
    if(s.golfLinks) embed.addField('Golf Links', s.golfLinks)
    
    author.send(embed)
  })
}

client.on('message', async message => {
  //TODO: Protect command
  //if (message.author.username !== 'SunriseM') return;
 
  if (!message.content.trim().startsWith(PREFIX)) return;

  const [cmd, ...args] = message.content.slice(1).split(/\s+/)

  if(cmd !== 'getsol') return;
  if(!args.length) return;

  const day = Number(args[0]);
  if(isNaN(day)) return;

  await message.react('🤠')

  getSolutions(<TextChannel>message.channel, day, message.author);
})
  
client.login(process.env.DISCORD_TOKEN)
