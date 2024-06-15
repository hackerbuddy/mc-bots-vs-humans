# Minecraft Bots vs Humans

This is a `NodeJS` project which uses the powerful open-source `mineflayer` network API to create intelligent Minecraft "Bots", which can join a Minecraft Server for the purposes of fun and mischief. This particular project uses this capability to set up a game mode where human players and bots can join teams and fight against eachother.

## Purpose

I used the codebase here to teach students how to write basic `Javascript` and `NodeJS` in a engaging way.

## Some basic descriptions

1. `admin-bot.js` - summon the AdminBot, which in turn orchestrates the "AttackBots", who will attack a list of Players.
2. `attack-bot.js` - invoked by the AdminBot to summon bots which will attack Players in the list of Players

## Challenges

1. It's fairly easy to accidentally DDOS a Minecraft Server by sending too much network traffic at once from `mineflayer` bot clients. A big chunk of code (`delayQueueHelpers.js`) seeks to throttle the amount of network traffic sent to the Minecraft Server.
2. You need to disable Minecraft verification to allow Minecraft bots without accounts to run on your MC Server. Disabling MC account verification can allow hackers to grief your server by "spoofing" the `UUID` of existing players, so I had to install MC plugins on the MC Server itself to prevent this -- any "passwords" you see in source code refer to this plugin.
3. Parallelism and async code: all over the place.

## If I revive this project I will
1. Clean up source code
2. Write a `Dockerfile` to automate the entire server + bots
3. Implement bot-to-bot communication (using chat messages, or inter-process networking)