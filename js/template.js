function createLink(href, text) {
    let a = document.createElement("a");
    a.href = href;
    let textNode = document.createTextNode(text);
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
    links.appendChild(createLink("profile.html", "PROFILE"));
    links.appendChild(createLink("contribute.html", "CONTRIBUTE"));
    nav.appendChild(links);

    return nav;
}

function createFooter() {
    let footer = document.createElement("div");
    footer.classList.add("footer");

    let link = createLink("https://twitter.com/MountOffs", "© 2022 MountOffs");
    footer.appendChild(link);

    return footer;
}


let page = document.querySelector(".page");
if (page) {
    document.body.insertBefore(createNav(), page);
}

document.body.appendChild(createFooter());