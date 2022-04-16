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
        console.log("show login");
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
    links.appendChild(createLink("archive.html", "ARCHIVE"));
    if (isLoggedIn()) {
        links.appendChild(createLink("profile.html", "PROFILE"));
    } else {
        links.appendChild(createLoginBtn());
    }
    links.appendChild(createLink("contribute.html", "CONTRIBUTE"));
    nav.appendChild(links);

    return nav;
}

function isLoggedIn() {
    return false;
    let region = localStorage.getItem("region");
    let realm = localStorage.getItem("realm");
    let char = localStorage.getItem("character");
    return region != null && realm != null && char != null;
}

function createFooter() {
    let footer = document.createElement("div");
    footer.classList.add("footer");

    let link = createLink("https://twitter.com/MountOffs", "© 2022 MountOffs");
    footer.appendChild(link);

    return footer;
}

function createNode(type, text) {
    let node = document.createElement(type);
    let textNode = document.createTextNode(text);
    node.appendChild(textNode);
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

    let button = createNode("button", "CLOSE");

    let charText = document.createElement("input");
    charText.type = "text";
    charText.id = "charText";
    charText.addEventListener("input", (e) => {
        let value = e.target.value;
        button.disabled = (value === null || value === "");
    });

    button.disabled = true;
    button.classList.add("modalButton");
    button.addEventListener('click', () => {
        let region = regionSelect.value;
        let realm = realmSelect.value;
        let char = charText.value.toLowerCase();
        console.log("Login: " + region + " " + realm + " " + char);
        getMounts(region, realm, char, (mounts) => {
            localStorage.setItem("region", region);
            localStorage.setItem("realm", realm);
            localStorage.setItem("character", char);
            localStorage.setItem("mounts", JSON.stringify(mounts));
            console.log(mounts);
            //location.reload();
        });
        dialog.close();
    });

    container.append(h2, regionLabel, regionSelect, realmLabel, realmSelect, charLabel, charText, button);
    dialog.appendChild(container);
    return dialog;
}


let page = document.querySelector(".page");
if (page) {
    document.body.insertBefore(createNav(), page);
    document.body.appendChild(createLoginDialog());
}

document.body.appendChild(createFooter());