const { Timer } = require('timer-node');
const mineflayer = require('mineflayer')

const { exit } = require('process')

const createHash = require('crypto').createHash
const DelayQueueManager = require('./lib/delayQueueHelpers');
const YAML = require('yaml')
const fs = require('fs');
const file = fs.readFileSync('./config.yml', 'utf8')
const config = YAML.parse(file)

const bot = mineflayer.createBot(
  {
    host: 'ip-or-hostname-here', // minecraft server ip
    port: 55555, // only set if you need a port that isn't 25565
    version: '1.20', // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
    username: config.admin
  }
)

// We will be calling this function to make the admin bot run chat commands
function botChat(message){
  if(message){
    bot.chat(message)
  }
}

const humans = config.humans

const robots = config.bots
const admin = config.admin
const maxNumberOfBots = 3
let gameHasStartedYet = false

const adminPass = 'someAdminPassHere'
const attackBotPass = 'someAttackBotPassHere'

const humanTeamCoords = {
  x: config.humanTeamCoords.x,
  y: config.humanTeamCoords.y,
  z: config.humanTeamCoords.z
}

const robotTeamCoords = {
  x: humanTeamCoords.x + 12,
  y: 100,
  z: humanTeamCoords.z + 48
}

const adminBotCoords = {
  x: robotTeamCoords.x,
  y: robotTeamCoords.y + 50,
  z: robotTeamCoords.z
}

const botArenaSchematic = 'bot-arena-10-11-23-v2.schem'
//let safeBotChatCluster = []
console.log(humanTeamCoords.x)

function doneWaitingToAuthenticate () {
  console.log('Done waiting to auth!')
}
console.log(getUUID(admin))
bot.on('kicked', (message) => {
  console.log(message)
})

bot.on('error', (message) => {
  console.log(message)
})

 /* NOTE: At the time of coding, an Operator will manually have to update
 /        the Admin's password, like "/auth register 1d093813-d883-3c09-b83e-2f88f8eecc0c HHEFKeufuef883"
 /        Later we will write a script for a normal player to initialize the Admin automatically        
*/
bot.once('login', () => {
  console.log('I logged in! or do I spawn first?')
  //IMPORTANT! This Object, defined in ./lib/delayQueueHelpers.js, helps us schedule commands with delays
  DelayQueueManager.run()

  loginAdminBotMsg = `/login ${adminPass}`
  bot.chat('Hello')
  DelayQueueManager.scheduleFunc(botChat, 3000, loginAdminBotMsg)
  DelayQueueManager.scheduleFunc(botChat, 10000, 'Hello Mere Mortals')
  DelayQueueManager.scheduleFunc(botChat, 50, `/tp @a ${adminBotCoords.x} ${adminBotCoords.y} ${adminBotCoords.z}`)
  DelayQueueManager.scheduleFunc(botChat, 5000, `hello there!`)

  newGame();
})

function spawnBot (botName) {
  // On Windows Only...
  const { spawn } = require('node:child_process')
  const bat = spawn('cmd.exe', ['/c', `node attack-bot-11-15-23.js ${botName}`])
  DelayQueueManager.scheduleFunc(botChat, 1000, `/tp ${botName} ${robotTeamCoords.x} ${robotTeamCoords.y} ${robotTeamCoords.z}`)

  bat.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  bat.stderr.on('data', (data) => {
    console.error(data.toString())
  })

  bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`)
  })
}

function newGame () {
  DelayQueueManager.scheduleFunc(botChat, 1000, 'Game is about to start!!')
  DelayQueueManager.scheduleFunc(botChat, 1000, 'Spawning bots...')

  var i = 0;
  for(i=0; i<8; i++){

    const players = Object.keys(bot.players)
    console.log('------------------------------')
    console.log(`Players online: ${players}\n`)
  
    const onlineRobots = players.filter(player => robots.includes(player))
    const offlineRobots = robots.filter(player => !onlineRobots.includes(player))
    const spawnThisRobot = getRandomItemFromList(offlineRobots)
    
    spawnBot(spawnThisRobot)
    }   


  DelayQueueManager.scheduleFunc(botChat, 20, '/kill @e[type=!player]')

  DelayQueueManager.scheduleFunc(botChat, 50, `/tp @a[team=robots] ${robotTeamCoords.x} ${robotTeamCoords.y} ${robotTeamCoords.z}`)
  DelayQueueManager.scheduleFunc(botChat, 50, `/spawnpoint @a[team=robots] ${robotTeamCoords.x} ${robotTeamCoords.y} ${robotTeamCoords.z}`)
  DelayQueueManager.scheduleFunc(botChat, 50, `/tp @a[team=humans] ${humanTeamCoords.x} ${humanTeamCoords.y} ${humanTeamCoords.z}`)
  DelayQueueManager.scheduleFunc(botChat, 50, `/spawnpoint @a[team=humans] ${humanTeamCoords.x} ${humanTeamCoords.y} ${humanTeamCoords.z}`)
  DelayQueueManager.scheduleFunc(botChat, 50, '/gamemode survival @a')
  DelayQueueManager.scheduleFunc(botChat, 50, '/gamemode creative')

  DelayQueueManager.scheduleFunc(botChat, 50, '/clear @a', '/difficulty hard')

  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_sword')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_chestplate')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_pickaxe')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_helmet')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_leggings')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a iron_boots')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a bow')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a arrow 128')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a dirt 256')
  DelayQueueManager.scheduleFunc(botChat, 50, '/give @a stone 128')

  DelayQueueManager.scheduleFunc(botChat, 50,'/effect clear')
  DelayQueueManager.scheduleFunc(botChat, 50,'/scoreboard objectives remove kills')
  DelayQueueManager.scheduleFunc(botChat, 50,'/scoreboard objectives add kills playerKillCount')
  DelayQueueManager.scheduleFunc(botChat, 50,'/scoreboard objectives setdisplay sidebar kills')

  // DelayQueueManager.scheduleFunc(botChat, 50, `//pos1 ${humanTeamCoords.x + 65},${humanTeamCoords.y + 18},${humanTeamCoords.z + 30}`)
  // DelayQueueManager.scheduleFunc(botChat, 50, `//pos2 ${humanTeamCoords.x - 19},${humanTeamCoords.y - 40},${humanTeamCoords.z + 30}`)
  // safeBotChat([`//pos1 ${humanTeamCoords.x+1},${humanTeamCoords.y+1},${humanTeamCoords.z+1}`])
  // safeBotChat([`//pos2 ${humanTeamCoords.x+1},${humanTeamCoords.y+1},${humanTeamCoords.z+1}`])
  // DelayQueueManager.scheduleFunc(botChat, 100, '//set glass')
  DelayQueueManager.scheduleFunc(botChat, 50, 'Game has started!! Good luck humans!')
}

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}
function getRandomItemFromList (arr) {
  if (arr.length >= 1) {
    return arr[getRandomInt(arr.length - 1)]
  } else {
    return arr[0]
  }
}

function getUUID (playerName) {
  // sleepForMilliseconds(100);
  playerName = playerName.toLowerCase()

  let playerUUID = ''
  const hash = createHash('md5') // v3
  hash.once('readable', () => {
    const data = hash.read()
    const uuid = [...data]
    // https://www.rfc-editor.org/rfc/rfc4122#section-4.3
    uuid[6] = (data[6] & 0x0f) | 0x30 // v3
    uuid[8] = (data[8] & 0x3f) | 0x80
    playerUUID = splittedUUID(toHexString(uuid))
  })

  function toHexString (byteArray) {
    return byteArray
      .map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
      .join('')
  }

  function splittedUUID (uuid) {
    return [
      uuid.substring(0, 8),
      uuid.substring(8, 12),
      uuid.substring(12, 16),
      uuid.substring(16, 20),
      uuid.substring(20, 32)
    ].join('-')
  }

  hash.write('OfflinePlayer:' + playerName)
  hash.end()
  return playerUUID
  // return `[${playerUUID}]`;
}
