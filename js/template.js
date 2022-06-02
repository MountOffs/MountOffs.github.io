function createLink(href, text) {
    let a = document.createElement("a");
    a.href = href;
    let textNode = document.createTextNode(text);
    a.appendChild(textNode);
    return a;
}

function createLoginBtn() {
    let a = document.createElement("a");
    a.onclick = function () {
        const modal = document.querySelector('#loginModal');
        modal.showModal();
    };
    let textNode = document.createTextNode("LOGIN");
    a.appendChild(textNode);
    return a;
}

function createNav() {
    let nav = document.createElement("nav");
    nav.classList.add("nav");

    let header = document.createElement("h1");
    header.classList.add("title");
    let headerLink = createLink("index.html", "Mount Offs");
    header.appendChild(headerLink);
    nav.appendChild(header);

    let links = document.createElement("div");
    links.classList.add("links");
    links.appendChild(createLink("about.html", "ABOUT"));
    links.appendChild(createLink("play.html", "PLAY"));
    if (isLoggedIn()) {
        links.appendChild(createLink("profile.html", "PROFILE"));
    } else {
        links.appendChild(createLoginBtn());
    }
    nav.appendChild(links);

    return nav;
}

function isLoggedIn() {
    let region = getLocalStorage("region");
    let realm = getLocalStorage("realm");
    let char = getLocalStorage("character");
    return region != null && realm != null && char != null;
}

function createFooter() {
    let footer = document.createElement("div");
    footer.classList.add("footer");

    let link = createLink("https://twitter.com/MountOffs", "© 2022 MountOffs");
    footer.appendChild(link);

    return footer;
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

function createLoginDialog() {
    let dialog = document.createElement("dialog");
    dialog.id = "loginModal";
    dialog.classList.add("modal");
    let container = document.createElement("div");
    container.classList.add("modalContainer");
    let h2 = createNode("h2", "Enter realm and character");

    let regionLabel = createNode("label", "Region");
    regionLabel.id = "regionLabel";
    regionLabel.for = "regionSelect";

    let regionSelect = document.createElement("select");
    regionSelect.id = "regionSelect";
    regionSelect.appendChild(new Option("EU", "eu"));
    regionSelect.appendChild(new Option("US", "us"));

    let realmLabel = createNode("label", "Realm");
    realmLabel.id = "realmLabel";
    realmLabel.for = "realmSelect";

    let realmSelect = document.createElement("select");
    realmSelect.id = "realmSelect";
    realms.eu.forEach(realm => {
        realmSelect.appendChild(new Option(realm.name, realm.slug));
    });

    regionSelect.addEventListener("change", (e) => {
        let value = e.target.value;
        realmSelect.innerHTML = "";
        realms[value].forEach(realm => {
            realmSelect.appendChild(new Option(realm.name, realm.slug));
        });
    });

    let charLabel = createNode("label", "Character");
    charLabel.id = "charLabel";
    charLabel.for = "charSelect";

    let button = createNode("button", "LOGIN");

    let charText = document.createElement("input");
    charText.type = "text";
    charText.id = "charText";
    charText.addEventListener("input", (e) => {
        let value = e.target.value;
        button.disabled = (value === null || value === "");
    });
    charText.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            button.click();
        }
    });

    button.disabled = true;
    button.classList.add("modalButton");
    button.addEventListener('click', () => {
        let region = regionSelect.value;
        let realm = realmSelect.value;
        let char = charText.value.toLowerCase();
        console.log("Login: " + region + " " + realm + " " + char);
        fetchMounts(region, realm, char, (mounts) => {
            setLocalStorage("region", region);
            setLocalStorage("realm", realm);
            setLocalStorage("character", char);
            cacheMounts(mounts);
            location.href = "profile.html";
        });
        dialog.close();
    });

    container.append(h2, regionLabel, regionSelect, realmLabel, realmSelect, charLabel, charText, button);
    dialog.appendChild(container);
    return dialog;
}

function secondsToTime(seconds) {
    let date = new Date(0);
    date.setSeconds(seconds); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
}

function timeToSeconds(time) {
    let parts = time.split(":");
    if (parts.length === 3) {
        return parts[0] * 60 * 60 + parts[1] * 60 + parts[2] * 1;
    } else {
        return parts[0] * 60 + parts[1] * 1;
    }
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

function removeLocalStorage(key) {
    key = "_" + key;
    localStorage.removeItem(key);
}

function cacheMounts(mounts) {
    setLocalStorage("mounts", mounts, 24 * 60 * 60 * 1000);
}

let page = document.querySelector(".page");
if (page) {
    document.body.insertBefore(createNav(), page);
    document.body.appendChild(createLoginDialog());
}

document.body.appendChild(createFooter());