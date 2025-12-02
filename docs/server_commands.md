# Server Commands

This document lists all available server commands, including built-in commands from `DanhengServer` and extra commands from `DanhengPlugin-DHConsoleCommands`.

## Built-in Commands

### /account
**Description**: Create an account. Note: This command is untested, use with caution!
**Usage**: `Usage: /account create <username>`
*   `/account create <username> [uid]` - Create a new account.

### /avatar (Aliases: av, ava)
**Description**: Set the properties of the avatars player owned.
When set talent level, set to X level means set all talent point to X level, if greater than the point max level, set to max level.
Notice: -1 means all owned avatars.
**Usage**: 
```
Usage: /avatar talent [Avatar ID/-1] [Talent Level]
Usage: /avatar get [Avatar ID]
Usage: /avatar rank [Avatar ID/-1] [Rank]
Usage: /avatar level [Avatar ID/-1] [Avatar Level]
```

### /clear
**Description**: Clear unequipped items from inventory.
**Usage**:
```
Usage: /clear equipment
Usage: /clear relic
```

### /debug
**Description**: Debug commands for development.
**Usage**:
```
Usage: /debug specific <stageId>
Usage: /debug monster <monsterId>
Usage: /debug customP <filePath>
```

### /give (Alias: g)
**Description**: Give player items, item id can be avatar id, but cant set level, talent, rank.
**Usage**: `Usage: /give [item ID] l<level> x<amount> r<rank>`

### /giveall (Alias: ga)
**Description**: Give the player all specified types of items.
avatar means characters, equipment means light cones, relic means relic(artifact), unlock means chatBubbles, avatar(head icon), wallpaper.
**Usage**:
```
Usage: /giveall avatar r<rank> l<level>
Usage: /giveall equipment r<rank> l<level> x<amount>
Usage: /giveall relic l<level> x<amount>
Usage: /giveall unlock
```

### /grid
**Description**: Manage Grid Fight (Chess Rogue) components.
**Usage**:
```
Usage: /grid role <roleId> <tier>
Usage: /grid gold <amount>
Usage: /grid equip <equipmentId>
Usage: /grid orb <orbId>
Usage: /grid consumable <consumableId>
Usage: /grid section <chapterId> <sectionId>
```

### /help (Alias: h)
**Description**: Show help information.
**Usage**:
```
Usage: /help
Usage: /help [cmd]
```

### /hero
**Description**: Switch the gender/type of the main character.
When switch the gender, 1 means male, 2 means female.
When switch the type(path), 8001 means Destruction, 8003 means Preservation, 8005 means Harmony.
Notice: Switch gender will clear all the paths and talents of main character, this operation is irreversible!
**Usage**:
```
Usage: /hero gender [genderId]
Usage: /hero type [typeId]
```

### /kick
**Description**: Kick out player.
**Usage**: `Usage: /kick`

### /lineup
**Description**: Manage player's lineup. Technique Point can gain 2 each time.
**Usage**:
```
Usage: /lineup mp [amount]
Usage: /lineup heal
```

### /mail
**Description**: Manage player's mails.
**Usage**: `Usage: /mail [senderName] [templateId] [expiryDays] _TITLE [title] _CONTENT [content]`

### /mission (Alias: m)
**Description**: Manage player's missions.
Use 'pass' to finish all running mission, this command will cause severe lagging, please use '/mission finish' instead.
Use 'finish [SubMissionID]' to finish certain sub-mission，please find sub-mission id in handbook.
Use 'finishmain [MainMissionID]' to finish certain main mission，please find main mission id in handbook.
Use 'running <-all>' to get the tracking mission, adding '-all' shows all running mission and possible stuck missions, after use, a longer mission list may appear, please note that.
Use 'reaccept' to re-accept given main mission, please find main mission id in handbook.
**Usage**:
```
Usage: /mission pass
Usage: /mission finish [Sub mission ID]
Usage: /mission running
Usage: /mission reaccept [main mission id]
```

### /raid
**Description**: Manage player's temporary scene.
**Usage**: `Usage: /raid leave - leave temporary scene`

### /relic
**Description**: Manage player's relics.
main affix optional, sub affix optional, but at least one of them exists.
Level limit: 1≤Level≤9999.
**Usage**: `Usage: /relic <relic ID> <main affix ID> <sub affix ID1:sub affix level> <sub affix ID2:sub affix level> <sub affix ID3:sub affix level> <sub affix ID4:sub affix level> l<level> x<amount>`

### /reload
**Description**: Reload specified configuration. Config Name: banner - Gacha Pool, activity.
**Usage**: `Usage: /reload <config name>`

### /rogue (Alias: r)
**Description**: Manage player's data in the simulated universe.
-1 means all blessings (all owned blessings).
Use 'buff' to get blessings.
Use 'enhance' to enhance blessings.
**Usage**:
```
Usage: /rogue money [Universe Debris Amount]
Usage: /rogue buff [Blessing Id/-1]
Usage: /rogue miracle [Miracle ID]
Usage: /rogue enhance [Blessing ID/-1]
Usage: /rogue unstuck - Leave event
```

### /scene
**Description**: Manage player scenes.
Note: Most commands in this group are for debugging purposes. Please ensure you understand what you are doing before using any command.
Use 'prop' to set the state of a prop. For a list of states, refer to Common/Enums/Scene/PropStateEnum.cs.
Use 'unlockall' to unlock all props in the scene (i.e., set all props that can be opened to the 'open' state). This command may cause the game to load to about 90%. Use '/scene reset <floorId>' to resolve this issue.
Use 'change' to enter a specified scene. For EntryId, refer to Resources/MapEntrance.json.
Use 'reload' to reload the current scene and return to the initial position.
Use 'reset' to reset the state of all props in the specified scene. For the current FloorId, use '/scene cur'.
**Usage**:
```
Usage: /scene prop [groupId] [propId] [state]
Usage: /scene remove [entityId]
Usage: /scene unlockall
Usage: /scene change [entryId]
Usage: /scene reload
Usage: /scene reset <floorId>
```

### /setlevel (Alias: level)
**Description**: Set player level.
**Usage**: `Usage: /setlevel <Level>`

### /unlockall (Alias: ua)
**Description**: Unlock the objects in given category.
Use '/unlockall mission' to finish all missions, and the target player will be kicked, after re-login, the player may be stuck in tutorial, please use with caution.
Use '/unlockall tutorial' to unlock all tutorials, and the target player will be kicked, used for being stuck in some pages.
Use '/unlockall rogue' to unlock all types of rogue, and the target player will be kicked, used with '/unlockall tutorial' to get better performance.
**Usage**: `Usage：/unlockall [mission/tutorial/rogue]`

### /unstuck
**Description**: Teleport player back to default location.
**Usage**: `Usage: /unstuck <UID>`

### /windy
**Description**: Kinda windy today!
**Usage**: `/windy <lua_script_file>`

---

## Plugin Commands (DHConsoleCommands)

### /buildchar
**Description**: Build a character
**Usage**: `/buildchar (recommend) <avatarId/all>`
*   `/buildchar all` - Build all avatars with recommended relics.
*   `/buildchar recommend <avatarId>` - Build a specific avatar with recommended relics.
*   `/buildchar <avatarId>` - Build a specific avatar (default behavior).

### /debuglink
**Description**: debug item equip status
**Usage**: `/debuglink <avataritem/avatarrelic/item/relic>`
*   `/debuglink avataritem` - List avatar equipment links.
*   `/debuglink avatarrelic` - List avatar relic links.
*   `/debuglink item` - List equipment item links.
*   `/debuglink relic` - List relic item links.

### /equip
**Description**: Equip a character
**Usage**: `/equip item <avatarId> <itemId> l<level> r<rank> or /equip relic <avatarId> <relicId> <mainAffixId> <subAffixId*4>:<level*4>`
*   `/equip item <avatarId> <itemId> l<level> r<rank>` - Equip a light cone to an avatar.
*   `/equip relic <avatarId> <relicId> <mainAffixId> [subAffixId:level]...` - Equip a custom relic to an avatar.

### /fetch
**Description**: fetch data about a player
**Usage**: `/fetch <owned/avatar/inventory/player> ...`
*   `/fetch owned` - List owned avatar IDs.
*   `/fetch player` - Show player basic info.
*   `/fetch avatar <avatarId>` - Show detailed info about a specific avatar.
*   `/fetch inventory` - List inventory items (materials).
*   `/fetch scene` - List props in the current scene.
*   `/fetch npc` - List NPCs in the current scene.

### /gametext
**Description**: return in-game translation for a certain language
**Usage**: `/gametext <avatar/item/mainmission/submission> #<language>`
*   `/gametext avatar #<language>` - Get localized names for all avatars.
*   `/gametext item #<language>` - Get localized names for all items.
*   `/gametext mainmission #<language>` - Get localized names for all main missions.
*   `/gametext submission #<language>` - Get localized names for all sub missions.
*   `/gametext relic` - List relic IDs and types.

### /remove
**Description**: remove a character or unequipped relics
**Usage**: `/remove <avatar/relics/equipment> <avatarId>`
*   `/remove relics` - Remove all unequipped relics.
*   `/remove equipment` - Remove all unequipped light cones.
*   `/remove avatar <avatarId>` - Remove a specific avatar and its equipment.
