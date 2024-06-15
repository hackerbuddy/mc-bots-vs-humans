// June 31 2023
const armorManager = require("mineflayer-armor-manager");
const mineflayer = require("mineflayer");
const collectBlock = require("mineflayer-collectblock").plugin;
const toolPlugin = require("mineflayer-tool").plugin;
const config = YAML.parse(file)

const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const Vec3 = require("vec3");

var botUsername = process.argv[2]

const humans = config.humans

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

//NOTE: it takes about ~60 seconds for a Bot's password to be updated!!
var botPass = "passwordForRobots!"

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
// Change to whatever your port is in "Open to LAN"
const bot = mineflayer.createBot({
  host: "host-or-ip-of-mc-server-here", // minecraft server ip
  port: 55555, // only set if you need a port that isn't 25565
  version: "1.20", // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  username:
  botUsername//getRandomItemFromList(robots)
  ,
  
});
bot.physicsEnabled = true;

bot.loadPlugin(collectBlock);
bot.loadPlugin(toolPlugin);
bot.loadPlugin(armorManager);

bot.on("kicked", (message) => {
  console.log(message)
})

bot.on("error", (message) => {
  console.log(message)
})

var rangeGoal = 1; // get within this radius of the player

var seconds = 0;

bot.loadPlugin(pathfinder);

var busy = true;
var successfullyAuthenticated = false;
// Note: Must authenticate here!!
bot.once("login", () => {
  console.log('Attempting to authenticate...')
  //bot.chat(`/logout`)
  //bot.chat(`/register ${botPass} ${botPass}`)
  bot.chat(`/login ${botPass}`)
  successfullyAuthenticated = true;
})

bot.once("spawn", () => {
  console.log('I just died or joined for the first time!')
  onLoginAndRespawn();
});

bot.on("chat", (message) => {
  console.log(message)
})


function onLoginAndRespawn(){
  noLongerBusy()
  players = Object.keys(bot.players);
  
  let onlineHumans = players.filter(player => humans.includes(player));
  console.log('Online Humans:' + onlineHumans);
  playerHunted = getRandomItemFromList(onlineHumans);


  bot.chat(`Coming after you, ${playerHunted}!`);

  weaponsAndArmor = getWeaponsAndArmorNames()
  buildingMaterials = ['dirt', 'stone', 'cobblestone']
  allItemsToLoot = [];

  weaponsAndArmor.forEach(item => allItemsToLoot.push(item))
  buildingMaterials.forEach(item => allItemsToLoot.push(item))

  lootChest(false, ['chest'], allItemsToLoot, 64);
  bot.waitForTicks(100);
}

bot.on("time", (username, message) => {
  if(successfullyAuthenticated){
    //const defaultMove = new Movements(bot);
    seconds += 1;
    console.log(`${bot.username} running for seconds: ${String(seconds)}`);

    //if the number of seconds is divisible by 20 (every 20 seconds),
    //then we will attempt to equip these items below
    if (!busy && seconds % 5 == 0) {

      equipBestArmors();
      equipBestSword();

    }

    if(!busy){
      var entity = bot.players[playerHunted]?.entity;

      if (!entity){

        players = Object.keys(bot.players);

        let onlineHumans = players.filter(player => humans.includes(player));

        var previousPlayerHunted = playerHunted
        

        console.log('Online Humans:' + onlineHumans);

        playerHunted = getRandomItemFromList(onlineHumans);

        entity = bot.players[playerHunted]?.entity;
        
        if(entity == null){
          doNothing();
        }
        else{
        //set this as our new target
        
        console.log('playerhunted is now ' + playerHunted)
        // target = bot.players[playerHunted]?.entity;
        console.log(previousPlayerHunted + ' was too scared too fight. Coming after you ' + playerHunted + ' !');
        }
      }
      //const { x: playerX, y: playerY, z: playerZ } = target.position
      if(entity){
      attack(entity)
      }
      else{
        console.log(`${bot.username} could not find target to attack!`)
      }
    
    }
    function attack(entity) {
      bot.pathfinder.setGoal(
        new GoalNear(entity.position.x, entity.position.y, entity.position.z, 1)
      );

      if (entity !== null) {
        // Start attacking

        // if (hasItem("crossbow") && hasItem("arrow")) {
        //   rangeGoal = 20;
        //   if (!isChargingCrossbow) {
        //     //no need to get closer than 10 blocks away
        //     bot.pathfinder.setGoal(
        //       new GoalNear(entity.position.x, entity.position.y, entity.position.z, rangeGoal)
        //     );
        //     crossbowAttack(playerHunted);
        //   } else {
        //     console.log("Waiting for crossbow attack to finish...");
        //   }
        // }
        //we don't have a cross bow, use melee
        // else {
        //   rangeGoal = 1;
          bot.attack(entity, true);
        //}
      }
      else{
        console.log('nobody to hunt...BORING!!')
      }
    }
  }
  else{
    console.log("I'm not authenticated!")
  }
  });

      function attack() {
      //bot.pathfinder.setMovements(defaultMove);
      console.log('attacking')
      bot.pathfinder.setGoal(
        new GoalNear(playerX, playerY, playerZ, rangeGoal)
      );
      entity = bot.players[playerHunted]?.entity;
      // console.log("attacking")
      const filter = (e) =>
        e.username === playerHunted &&                
        e.position.distanceTo(bot.entity.position) < 40 &&
        e.mobType !== "Armor Stand"; // Mojang classifies armor stands as mobs for some reason?
      entity = bot.nearestEntity(filter);

      if (entity !== null) {
        // Start attacking

        if (hasItem("crossbow") && hasItem("arrow")) {
          rangeGoal = 20;
          if (!isChargingCrossbow) {
            //no need to get closer than 10 blocks away
            bot.pathfinder.setGoal(
              new GoalNear(playerX, playerY, playerZ, rangeGoal)
            );
            crossbowAttack(playerHunted);
          } else {
            console.log("Waiting for crossbow attack to finish...");
          }
        }
        //we don't have a cross bow, use melee
        else {
          rangeGoal = 1;
          bot.attack(entity, true);
        }
      }
    }


async function equipItem(itemId, bodyPart) {
  try {
    await bot.equip(itemId, bodyPart);
  } catch (err) {
    console.log(err.message)
    return; 
  }
}

function replaceLavaWithDirt() {
  // // Load pathfinder and collect block plugins
  // bot.loadPlugin(pathfinder)

  try {
    const blockType = bot.registry.blocksByName["lava"];
    // if (!blockType) {
    //   bot.chat("I don't know any blocks with that name.")
    //   return
    // }

    const blocks = bot.findBlocks({
      matching: blockType.id,
      maxDistance: 5,
      count: 1,
    });

    if (blocks.length == 1) {
      var block = blocks[0];
      //don't try to place blocks on lava that you can't see!
      if (bot.canSeeBlock(block)) {
        var block_pos = bot.blockAt(block);

        console.log(`${blockType.name} position: ${String(block_pos)}`);

        my_position = new Vec3(bot.entity.position);
        console.log(`My position: ${my_position}`);

        bot.equip(bot.registry.itemsByName.dirt.id, "hand");
        placeBlock(block_pos, new Vec3(0, 1, 0));
      }
    } else {
      console.log("no lava found!");
    }
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

async function placeBlock(block, side) {
  try {
    await bot.placeBlock(block, side);
  } catch (err) {
    console.log(err.message);
    return;
  }
}

function hasItem(itemName) {
  if (bot.inventory.items().find((item) => item.name === itemName)) {
    return true;
  } else {
    return false;
  }
}

isChargingCrossbow = false;

async function crossbowAttack(username) {
  const slotID = bot.getEquipmentDestSlot("hand");
  if (
    bot.inventory.slots[slotID] === null ||
    bot.inventory.slots[slotID].name !== "crossbow"
  ) {
    const weaponFound = bot.inventory
      .items()
      .find((item) => item.name === "crossbow");
    if (weaponFound) {
      await bot.equip(weaponFound, "hand");
    } else {
      console.log("No crossbow in inventory");
      return;
    }
  }
  isChargingCrossbow = true;

  const timeForCharge = 1250; //1250 - ((isEnchanted ? isEnchanted.lvl.value : 0) * 250)

  bot.activateItem(); // charge
  //bot.chat('charging my crossbow...')
  await sleep(timeForCharge); // wait for crossbow to charge
  bot.deactivateItem(); // raise weapon
  //bot.chat('crossbow ready to fire!')
  try {
    //bot.chat('trying to lookAt target...')
    var targetPos = new Vec3(bot.players[username].entity.position).add(
      new Vec3(0, 1, 0)
    );
    await bot.lookAt(targetPos, true);
    //await bot.waitForseconds(1) // wait for lookat to finish
    //bot.chat('about to fire...')
    bot.activateItem(); // fire
    //bot.chat('I just fired my crossbow!')
    bot.deactivateItem();
    isChargingCrossbow = false;
  } catch (err) {
    console.log("Player disappeared, crossbow is charged now.");
    isChargingCrossbow = false;
  }
  isChargingCrossbow = false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addSuffixToUsername(playerHuntedName, suffix) {
  const MAX_USERNAME_LENGTH = 16;

  if (playerHuntedName.length > 16 || suffix.length > 16) {
    console.error(
      "Ok, now you're just messing with me...Minecraft playernames can't be longer than 16 chars, nor can suffixes be!"
    );
    return "ERROR";
  }

  let charactersToChopOut =
    playerHuntedName.length - (MAX_USERNAME_LENGTH - suffix.length);

  if (charactersToChopOut > 0) {
    playerHuntedName = playerHuntedName.slice(0, -charactersToChopOut);
  }
  usernameWithSuffix = playerHuntedName + suffix;

  return usernameWithSuffix;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function getRandomItemFromList(arr){
  if(arr.length >= 1){
    return arr[getRandomInt(arr.length - 1)]
  }
  else{
    return arr[0]
  }
}

function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    console.log(output)
  } else {
    console.log('empty')
  }
}

async function lootChest(minecart, blocks = [], itemsToLoot = [], numberOfItemsToWithdraw) {
  busyRightNow();

  let chestToOpen
  if (minecart) {
    chestToOpen = Object.keys(bot.entities)
      .map(id => bot.entities[id]).find(e => e.entityType === bot.registry.entitiesByName.chest_minecart &&
      e.objectData.intField === 1 &&
      bot.entity.position.distanceTo(e.position) < 3)
    if (!chestToOpen) {
      console.log('no chest minecart found')
      return
    }
  } else {
    chestToOpen = bot.findBlock({
      matching: blocks.map(name => bot.registry.blocksByName[name].id),
      maxDistance: 5
    })

    if (!chestToOpen) {
      console.log('no chest found')
      noLongerBusy();
      return
    }
    else{
      console.log('found a chest to open!')
    }
  }
  bot.pathfinder.setGoal(
    new GoalNear(chestToOpen.position.x, chestToOpen.position.y, chestToOpen.position.z, 1)
  );
  const chest = await bot.openContainer(chestToOpen)
  sayItems(chest.containerItems())
  chest.on('updateSlot', (slot, oldItem, newItem) => {
    console.log(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  chest.on('close', () => {
    console.log('chest closed')
    //Ready to continue with regular loop!
    noLongerBusy();
  })

  // This code below checks if the items we want are in the chest before attempting to grab it out
  chest_item_names = []
  console.log(chest.containerItems())
  chest.containerItems().forEach(chestItem => chest_item_names.push(chestItem.name))
  console.log(chest_item_names)
  uniqueItemsInChest = removeDuplicates(chest_item_names)
  console.log('Items we want to loot:' + String(itemsToLoot))

  let itemsWeWant = uniqueItemsInChest.filter(x => itemsToLoot.includes(x));
  console.log('Items that we want that are actually in chest:' + String(itemsWeWant))

  // Only try to remove items from the chest if they exist in the chest
  //itemsWeWant.forEach(item => withdrawItem(item, numberOfItemsToWithdraw));
  withdrawItem(itemsWeWant[0], numberOfItemsToWithdraw);
  //withdrawItem('dirt', 10);
  var i = 0; 
  for(i=0; i<itemsWeWant.length; i++){
    withdrawItem(itemsWeWant[i], numberOfItemsToWithdraw);
    await bot.waitForTicks(50);
    console.log('waited for some ticks')
  }
  //await bot.waitForTicks(20);
  
  closeChest();
  //bot.on('chat', onChat)

  function closeChest () {
    chest.close()
    //bot.removeListener('chat', onChat)
  }

  async function withdrawItem (name, amount) {
    const item = itemByName(chest.containerItems(), name)
    if (item) {
      try {
        await chest.withdraw(item.type, null, amount)
        console.log(`withdrew ${amount} ${item.name}`)
      } catch (err) {
        console.log(`unable to withdraw ${amount} ${item.name}`)
      }
    } else {
      console.log(`unknown item, or couldn't find any of item in chest ${name}`)
    }
  }

  async function depositItem (name, amount) {
    const item = itemByName(chest.items(), name)
    if (item) {
      try {
        await chest.deposit(item.type, null, amount)
        console.log(`deposited ${amount} ${item.name}`)
      } catch (err) {
        console.log(`unable to deposit ${amount} ${item.name}`)
      }
    } else {
      console.log(`unknown item ${name}`)
    }
  }
}

function noLongerBusy(){
  busy = false;
}

function busyRightNow(){
  busy = true;
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function itemByType (items, type) {
  let item
  let i
  for (i = 0; i < items.length; ++i) {
    item = items[i]
    if (item && item.type === type) return item
  }
  return null
}

function itemByName (items, name) {
  let item
  let i
  for (i = 0; i < items.length; ++i) {
    item = items[i]
    if (item && item.name === name) return item
  }
  return null
}

function getWeaponsAndArmorNames(itemType = String){
    material_types = getMaterialTypes();
    weapon_types = getWeaponTypes();
    armor_types = getArmorTypes();
    removeFromArray(armor_types)

    results = [];

    material_types.forEach(material_type => 
        weapon_types.forEach(weapon_type => 
            results.push(material_type + '_' + weapon_type
            ),
        armor_types.forEach(armor_type => 
            // if(material_type !== 'wooden' && material_type !== 'stone'){
            //   console.log('meh')
            // }
            material_type !== 'wooden' && material_type !== 'stone' ? results.push( material_type + '_' + armor_type) : doNothing()
        )))
    return results;
    }

function doNothing(){
  return null;
}

function getMaterialTypes(itemType = String){
    return ['wooden','stone','iron','diamond','golden','netherite']
    }

function getWeaponTypes(itemType = String){
    return ['hoe','shovel','pickaxe','axe','sword']
    }

function getArmorTypes(itemType = String){
    return ['boots','chestplate','helmet','leggings']
    }

function removeFromArray(array, item){
  var index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

function equipBestSword(){
  var materialTypes = getMaterialTypes()
  var swordTypes = []
  materialTypes.forEach(material => swordTypes.push(material + '_' + 'sword'))
  var hasTheseSwords = []
  //swordTypes.forEach(swordType => hasItem(swordType) ? hasTheseSwords.push(swordType) : console.log('does not have ' + swordType))
  //console.log('has these swords:' + String(hasTheseSwords))

  var i = 0;
  var bestSword = '';
  for(i=0; i<swordTypes.length; i++){
    if (hasItem(swordTypes[i])){
      //console.log('i have a ' + swordTypes[i]);
      bestSword = swordTypes[i];
    }
  }
  //Equip your best sword if you have one
  if(bestSword !== ''){
    //console.log('will attempt to equip ' + bestSword)
    equipItem(bot.registry.itemsByName[bestSword].id, 'hand');
  }
}
function equipBestArmors(){
  bot.armorManager.equipAll()
}