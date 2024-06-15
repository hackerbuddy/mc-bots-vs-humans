
const mineflayer = require("mineflayer");

const { exit } = require("process");

const createHash = require("crypto").createHash;

const YAML = require("yaml");
const fs = require("fs");    
const file = fs.readFileSync('./config.yml', 'utf8');
const config = YAML.parse(file);

var chatDelaySeconds = 4;
var ready_to_start_game = false
var busy_running_command = false
//This will repeat every N seconds!
var already_teleported_players_and_set_spawn = false

// console.log(getUUID(config["admin"]))
// exit() 
//c26dc3a4-559b-3b1d-a12e-25f0e8b01c8b
const bot = mineflayer.createBot(
    {
    host: "minecraft-server-ip-or-hostname", // minecraft server ip
    port: 55555, // only set if you need a port that isn't 25565
    version: "1.19", // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
    username: config["admin"]}
    );
