const urlTemplate = (region, realm, character, locale, token) => `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}/collections/mounts?namespace=profile-${region}&locale=${locale}&access_token=${token}`;

function getLocalStorage(key) {
    key = "_" + key;
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (item.expiry && now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}

function setLocalStorage(key, value, ttl = null) {
    key = "_" + key;
    const now = new Date();
    const item = {
        value: value
    };

    if (ttl) {
        item.expiry = now.getTime() + ttl;
    }

    localStorage.setItem(key, JSON.stringify(item))
}

function evaluateEpisode(episode, mounts, time = Number.POSITIVE_INFINITY) {
    if (!episode.events) {
        return null;
    } else {
        let phase = "ELIMINATION";
        let placing = 0;
        let losingMount = null;
        let missingMounts = [];
        episode.events.forEach(event => {
            if (timeToSeconds(event.time) > time) {
                return;
            }

            if (event.event === "PLAYER") {
                if (losingMount === null) {
                    placing = event.players;
                }
            } else if (event.event === "MOUNT") {
                let mount = event.mount;
                if (mounts.indexOf(mount) === -1) {
                    if (losingMount === null) {
                        losingMount = mount;
                    }

                    missingMounts.push(mount);
                }
            } else if (event.event === "PHASE") {
                if (losingMount === null) {
                    phase = event.phase;
                }
            }
        });

        return {
            "phase": phase,
            "placing": placing,
            "losingMount": losingMount,
            "missingMounts": missingMounts
        }
    }
}

function timeToSeconds(time) {
    let parts = time.split(":");
    if (parts.length === 3) {
        return parts[0] * 60 * 60 + parts[1] * 60 + parts[2] * 1;
    } else {
        return parts[0] * 60 + parts[1] * 1;
    }
}

function secondsToTime(seconds) {
    let h = Math.floor(seconds / 3600);
    seconds %= 3600;
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;

    h = String(h).padStart(2, "0");
    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    if (h === "00") {
        return m + ":" + s;
    } else {
        return h + ":" + m + ":" + s;
    }
}

function totalDuration() {
    let durationSeconds = episodes
        .map(episode => episode.events.filter(event => event.event === "VICTORY")[0].time)
        .map(timeToSeconds)
        .reduce((prev, current) => prev + current, 0);
    return secondsToTime(durationSeconds);
}

function clearSeen() {
    for (let i = 1; i <= episodes.length; i++) {
        removeLocalStorage("episode" + i + "_seen");
    }
}

function setAllSeen() {
    for (let i = 1; i <= episodes.length; i++) {
        setEpisodeSeen(i);
    }
}

function setEpisodeSeen(episodeId) {
    setLocalStorage("episode" + episodeId + "_seen", "1");
}

function firstUnseenEpisode() {
    for (let i = 1; i <= episodes.length; i++) {
        if (!seen(i)) {
            return i;
        }
    }

    return null;
}

function seen(episodeId) {
    let seen = getLocalStorage("episode" + episodeId + "_seen");
    return seen !== null;
}

function locale(region) {
    switch (region) {
        case "eu": return "en_GB";
        case "us": return "en_US";
        default: return "en_GB";
    }
}

function getToken(callback) {
    let token = getLocalStorage("token");
    if (!token) {
        authorize((response) => {
            let payload = JSON.parse(response);
            token = payload.access_token;
            let expires = payload.expires_in;
            setLocalStorage("token", token, expires * 1000);

            callback(token);
        });
    } else {
        callback(token);
    }
}

function authorize(callback) {
    post("https://us.battle.net/oauth/token", (response) => {
        callback(response);
    })
}

function post(url, callback) {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    const digest = "YzI3NGFjOGFmM2Q2NDgyMDliMjQ1NzBhZTBkOWFkY2I6Vjh4cndIZ2JmcjV4Nk4xWHZnREFVYzNscHhKN3prWHg=";
    request.setRequestHeader("Authorization", "Basic " + digest);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("grant_type=client_credentials");

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            callback(request.response);
        }
    };
}

function fetchMounts(region, realm, character, callback) {
    console.log("Fetching mounts");
    getToken((token) => {
        let url = urlTemplate(region, realm, character, locale(region), token);
        get(url, (response) => {
            let data = JSON.parse(response);
            let mounts = data.mounts.map(mount => mount.mount.name);
            mounts = processFactionMounts(mounts);
            console.log("Mounts fetched:", mounts);
            callback(mounts);
        });
    });
}

function get(url, callback) {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.send();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            callback(request.response);
        }
    };
}



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
    ["Chauffeured Mechano-Hog", "Chauffeured Mekgineer's Chopper"],

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
        if (mounts.indexOf(pair[0]) >= 0) {
            mounts.push(pair[1]);
        } else if (mounts.indexOf(pair[1]) >= 0) {
            mounts.push(pair[0]);
        }
    });

    return mounts;
}

function isLoggedIn() {
    let region = getLocalStorage("region");
    let realm = getLocalStorage("realm");
    let char = getLocalStorage("character");
    return region != null && realm != null && char != null;
}

function createNode(type, text, ...clazzes) {
    let node = document.createElement(type);
    let textNode = document.createTextNode(text);
    node.appendChild(textNode);
    clazzes.forEach(clazz => {
        node.classList.add(clazz);
    });
    return node;
}

function removeLocalStorage(key) {
    key = "_" + key;
    localStorage.removeItem(key);
}

function cacheMounts(mounts) {
    setLocalStorage("mounts", mounts, 24 * 60 * 60 * 1000);
}