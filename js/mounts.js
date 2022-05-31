function getMounts(callback) {
    if (!isLoggedIn()) {
        callback([]);
        return;
    }

    let mounts = getLocalStorage("mounts");
    if (mounts) {
        callback(mounts);
        return;
    }

    let region = getLocalStorage("region");
    let realm = getLocalStorage("realm");
    let char = getLocalStorage("character");
    fetchMounts(region, realm, char, (mounts) => {
        cacheMounts(mounts);
        callback(mounts);
    });
}

function processFactionMounts(mounts) {
    let mapping = [
    ["Red Dragonhawk", "Blue Dragonhawk"],
    ["Armored Red Dragonhawk", "Armored Blue Dragonhawk"],

    //GUILD
    ["Kor'kron Annihilator", "Golden King"],

    //SHADOWLANDS OK

    //BFA OK

    // Commendation
    ["Rubyshell Crolusk", "Azureshell Krolusk"],
    ["Bloodthirsty Dreadwing", "Priestess' Moonsaber"],

    ["Bloodflank Charger", "Ironclad Frostclaw"],
    ["Snapdragon Kelpstalker", "Deepcoral Snapdragon"],
    ["Broken Highland Mustang", "Highland Mustang"],
    //  Honeyback Harvester (TODO: what to do with this)

    //  Allied races (NOT MAPPED)
    ["Highmountain Thunderhoof", "Starcursed Voidstrider"],
    ["Nightborne Manasaber", "Lightforged Felcrusher"],
    ["Mag'har Direwolf", "Dark Iron Core Hound"],
    ["Zandalari Direhorn", "Kul Tiran Charger"],
    ["Caravan Hyena", "Mechagon Mechanostrider"],

    //  Reputation (NOT MAPPED)
    ["Alabaster Hyena", "Admiralty Stallion"],
    ["Expedition Bloodswarmer", "Dapple Gray"],
    ["Cobalt Pterrordax", "Smoky Charger"],
    ["Captured Swampstalker", "Proudmoore Sea Scout"],
    ["Voldunai Dunescraper", "Stormsong Coastwatcher"],
    ["Spectral Pterrorwing", "Dusky Waycrest Gryphon"],

    //LEGION
    ["Prestigious War Wolf", "Prestigious War Steed"],

    //DRAENOR
    ["Swift Frostwolf", "Dusty Rockhide"],
    ["Ironside Warwolf", "Armored Irontusk"],

    //MISTS
    ["Grand Wyvern", "Grand Gryphon"],
    ["Grand Armored Wyvern", "Grand Armored Gryphon"],
    ["Crimson Primal Direhorn", "Golden Primal Direhorn"],

    //CATACLYSM
    ["Spectral Wolf", "Spectral Steed"],

    //WRATH
    ["Armored Blue Wind Rider", "Armored Snowy Gryphon"],
    //  Argent tournament
    ["Sunreaver Dragonhawk", "Silver Covenant Hippogryph"],
    ["Thunder Bluff Kodo", "Gnomeregan Mechanostrider"],
    ["Darkspear Raptor", "Ironforge Ram"],
    ["Orgrimmar Wolf", "Stormwind Steed"],
    ["Silvermoon Hawkstrider", "Exodar Elekk"],
    ["Forsaken Warhorse", "Darnassian Nightsaber"],
    ["Swift Purple Raptor", "Swift Violet Ram"],
    ["White Skeletal Warhorse", "Swift Moonsaber"],
    ["Swift Burgundy Wolf", "Swift Gray Steed"],
    ["Great Golden Kodo", "Turbostrider"],
    ["Swift Red Hawkstrider", "Great Red Elekk"],
    ["Sunreaver Hawkstrider", "Quel'dorei Steed"],

    //  Tribute
    ["Swift Horde Wolf", "Swift Alliance Steed"],
    ["Crusader's Black Warhorse", "Crusader's White Warhorse"],

    //BURNING CRUSADE
    ["Swift Red Wind Rider", "Swift Red Gryphon"],
    ["Swift Green Wind Rider", "Swift Green Gryphon"],
    ["Swift Yellow Wind Rider", "Swift Blue Gryphon"],
    ["Swift Purple Wind Rider", "Swift Purple Gryphon"],
    ["Tawny Wind Rider", "Ebon Gryphon"],
    ["Blue Wind Rider", "Snowy Gryphon"],
    ["Green Wind Rider", "Golden Gryphon"],

    //CLASSIC
    ["Venomhide Ravasaur", "Winterspring Frostsaber"],

    //Racial mounts (NOT MAPPED)
    //  Orc-Human
    ["Black Wolf", "Black Stallion"],
    ["Brown Wolf", "Brown Horse"],
    ["Dire Wolf", "Chestnut Mare"],
    ["Timber Wolf", "Pinto"],
    ["Swift Brown Wolf", "Swift Brown Steed"],
    ["Swift Gray Wolf", "Swift White Steed"],
    ["Swift Timber Wolf", "Palomino"],

    //  Undead-Night Elf
    ["Red Skeletal Horse", "Striped Nightsaber"],
    ["Blue Skeletal Horse", "Striped Frostsaber"],
    ["Brown Skeletal Horse", "Spotted Frostsaber"],
    ["Black Skeletal Horse", "Striped Dawnsaber"],
    ["Green Skeletal Horse", "Swift Frostsaber"],
    ["Purple Skeletal Horse", "Swift Mistsaber"],
    ["Ochre Skeletal Warhorse", "Swift Stormsaber"],

    //  Troll-Draenei
    ["Emerald Raptor", "Gray Elekk"],
    ["Turquoise Raptor", "Brown Elekk"],
    ["Violet Raptor", "Purple Elekk"],
    ["Swift Blue Raptor", "Great Blue Elekk"],
    ["Swift Olive Raptor", "Great Green Elekk"],
    ["Swift Orange Raptor", "Great Purple Elekk"],

    //  Tauren-Dwarf
    ["Gray Kodo", "Gray Ram"],
    ["Brown Kodo", "Brown Ram"],
    ["White Kodo", "White Ram"],
    ["Great Gray Kodo", "Swift Gray Ram"],
    ["Great Brown Kodo", "Swift Brown Ram"],
    ["Great White Kodo", "Swift White Ram"],

    //  Blood Elf-Gnome
    ["Red Hawkstrider", "Red Mechanostrider"],
    ["Blue Hawkstrider", "Blue Mechanostrider"],
    ["Black Hawkstrider", "Unpainted Mechanostrider"],
    ["Purple Hawkstrider", "Green Mechanostrider"],
    ["Swift Pink Hawkstrider", "Swift White Mechanostrider"],
    ["Swift Green Hawkstrider", "Swift Green Mechanostrider"],
    ["Swift Purple Hawkstrider", "Swift Yellow Mechanostrider"],

    //  Goblin-Worgen
    ["Goblin Trike", "Mountain Horse"],
    ["Goblin Turbo-Trike", "Swift Mountain Horse"],

    //Honor mounts
    ["Black War Kodo", "Black Battlestrider"],
    ["Black War Wolf", "Black War Tiger"],
    ["Red Skeletal Warhorse", "Black War Steed"],
    ["Black War Raptor", "Black War Ram"],
    ["Swift Warstrider", "Black War Elekk"],
    ["Frostwolf Howler", "Stormpike Battle Charger"],

    //Vicious mounts
    ["Vicious Skeletal Warhorse", "Vicious Kaldorei Warsaber"],
    ["Vicious War Wolf", "Vicious War Steed"],
    ["Vicious War Raptor", "Vicious War Ram"],
    ["Vicious War Kodo", "Vicious War Mechanostrider"],
    ["Vicious Warstrider", "Vicious War Elekk"],
    ["Vicious War Trike", "Vicious Gilnean Warhorse"],
    ["Vicious War Scorpion", "Vicious War Lion"],
    ["Vicious War Clefthoof", "Vicious War Riverbeast"],
    ["Vicious Black Bonesteed", "Vicious Black Warsaber"],
    ["Vicious White Bonesteed", "Vicious White Warsaber"],

    //Promotion
    ["Orgrimmar Interceptor", "Stormwind Skychaser"],
    ["Alabaster Thunderwing", "Alabaster Stormtalon"],
    ["Gilded Ravasaur", "Seabraid Stallion"],
    ["Frostwolf Snarler", "Stormpike Battle Ram"],
    ["Warlord's Deathwheel", "Champion's Treadblade"]
    ];

    mapping.forEach(pair => {
        console.log(pair);
        if (mounts.indexOf(pair[0]) >= 0) {
            mounts.push(pair[1]);
        } else if (mounts.indexOf(pair[1]) >= 0) {
            mounts.push(pair[0]);
        }
    });

    return mounts;
}

function hasMount(mounts, mount) {
    return mounts.indexOf(mount) > -1;
}