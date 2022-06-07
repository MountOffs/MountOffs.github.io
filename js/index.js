let flkty;

function init() {
    createLoginDialog();

    document.querySelector("#about-anchor").addEventListener("click", () => switchPage("#about"));
    document.querySelector("#play-anchor").addEventListener("click", () => switchPage("#play"));
    document.querySelector("#profile-anchor").addEventListener("click", () => switchPage("#profile"));
    document.querySelector("#login-button").addEventListener("click", () => {
        const modal = document.querySelector('#loginModal');
        modal.showModal();

        setTimeout(() => {
            let closeDialog = (e) => {
                if (e.target === modal) {
                    console.log("modal = this");
                    window.removeEventListener("click", closeDialog);
                    modal.close();
                }
            };

            window.addEventListener("click", closeDialog);
        }, 0);
    });

    document.querySelector("#about-play-link").addEventListener("click", () => switchPage("#play"));

    initEpisodeSelection();
    //initSplash();

    switchPage(currentPage());
}

function setBackground(div, episode) {
    div.style["background-image"] = "url('https://i.ytimg.com/vi/" + episode.youtubeId + "/hqdefault.jpg')";
}

function initEpisodeSelection() {
    let list = document.querySelector("#episodes");

    episodes.forEach(episode => {
        let div = document.createElement("div");
        div.classList.add("gallery-cell");
        setBackground(div, episode);

        let backdrop = document.createElement("div");
        backdrop.classList.add("backdrop");
        div.appendChild(backdrop);

        let a = document.createElement("a");
        let text = document.createTextNode("Episode " + episode.id);
        a.appendChild(text);
        a.title = episode.date;
        a.href = "episode.html?id=" + episode.id;

        div.appendChild(a);
        list.appendChild(div);
    });
}

function initSplash() {
    let splashSeen = getLocalStorage("splashSeen");
    document.querySelector(".splashOverlay").style.display = splashSeen ? "none" : "block";
    document.querySelector(".enter").addEventListener("click", closeSplash);
}

function closeSplash() {
    setLocalStorage("splashSeen", true);
    document.querySelector(".splashOverlay").style.display = "none";
}

function updateFlickity() {
    let dots = document.querySelectorAll(".dot");
    dots.forEach(dot => {
        let id = dot.ariaLabel.substring(9);
        if (seen(id)) {
            dot.classList.add("seen");
        }
    });

    let cells = document.querySelectorAll(".gallery-cell");
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let id = i + 1;
        if (seen(id)) {
            cell.classList.add("seen");
        }
    }

    let unseenId = firstUnseenEpisode();
    if (unseenId) {
        flkty.select(unseenId - 1);
    }
}

function processPlay() {
    if (!flkty) {
        //for initial DOM loading on #play
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                flkty = new Flickity("#episodes", {
                    wrapAround: true,
                });
            });
            setTimeout(updateFlickity, 50);
        } else {
            flkty = new Flickity("#episodes", {
                wrapAround: true,
            });
            setTimeout(updateFlickity, 50);
        }
    }
}

function switchPage(page) {
    updateNavbar(page);

    let pages = document.querySelectorAll(".page");
    pages.forEach(page => {
        page.style.display = "none";
    });

    let currentPageId = page + "-page";
    let currentPage = document.querySelector(currentPageId);
    currentPage.style.display = "block";

    let footer = document.querySelector(".footer");
    if (page === "#profile") {
        footer.classList.add("hide");
    } else {
        footer.classList.remove("hide");
    }


    if (page === "#play") {
        processPlay();
    } else if (page === "#profile") {
        processProfile();
    } else if (page === "#about") {
        processAbout();
    }
}

function currentPage() {
    if (!document.location.hash) {
        return "#about";
    }
    return document.location.hash; //i.e. #about
}

function createLoginDialog() {
    let dialog = document.querySelector("#loginModal");
    let regionSelect = document.querySelector("#regionSelect");
    let realmSelect = document.querySelector("#realmSelect");
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

    let button = document.querySelector(".modalButton");

    let charText = document.querySelector("#charText");
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

    let errorMsg = document.querySelector(".error");
    let loader = document.querySelector(".lds-ellipsis");

    button.disabled = true;
    button.addEventListener('click', () => {
        let region = regionSelect.value;
        let realm = realmSelect.value;
        let char = charText.value.toLowerCase();
        loader.classList.remove("disabled");

        console.log("Login: " + region + " " + realm + " " + char);
        fetchMounts(region, realm, char).then(mounts => {
            setLocalStorage("region", region);
            setLocalStorage("realm", realm);
            setLocalStorage("character", char);
            cacheMounts(mounts);
            loader.classList.add("disabled");
            dialog.close();

            location.href = "index.html#profile";
            switchPage("#profile");
        }).catch(error => {
            loader.classList.add("disabled");
            errorMsg.innerText = "Couldn't fetch user";
            console.error(error);
        });
        errorMsg.innerText = "";
    });
}

function updateNavbar(page) {
    let links = document.querySelectorAll(".links > a");
    links.forEach(link => {
        link.classList.remove("current");
    });

    let current = document.querySelector(page + "-anchor");
    current.classList.add("current");

    let profile = document.querySelector("#profile-anchor");
    let login = document.querySelector("#login-button");

    profile.style.display = isLoggedIn() ? "inline" : "none";
    login.style.display = isLoggedIn() ? "none" : "inline";
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function processAbout() {
    document.querySelector("#total").innerText = episodes.length;
}

function processProfile() {
    if (isLoggedIn()) {
        let char = getLocalStorage("character");
        document.querySelector('#name').innerText = capitalize(char);
        document.querySelector("#logout").addEventListener("click", () => {
            logout();
        });
    }

    let episodeGrid = document.querySelector("#episodesGrid");

    episodeGrid.innerHTML = "";
    getMounts().then(mounts => {
        episodes.forEach(episode => {
            let status = evaluateEpisode(episode, mounts);
            if (status) {
                let nodes = createEpisodeStatus(episode,status);
                nodes.forEach(node => {
                    episodeGrid.append(node);
                });
            }
        });
    });
}

function logout() {
    removeLocalStorage("region");
    removeLocalStorage("realm");
    removeLocalStorage("character");
    removeLocalStorage("mounts");

    location.href = "index.html#about";
    switchPage("#about");
}

function placing(status) {
    if (status.losingMount === null) {
        return "VICTORY";
    } else if (status.phase === "ELIMINATION") {
        return "TOP " + status.placing;
    } else {
        return status.phase;
    }
}

function createEpisodeStatus(episode, status) {
    let episodeSpan = createNode("span", "Episode " + episode.id, "episode");
    let placingSpan = createNode("span", placing(status), "place");
    placingSpan.dataset.place = placing(status);
    let nodes = [];
    nodes.push(episodeSpan, placingSpan);

    let losingMountLabel;
    let losingMountSpan;

    if (status.losingMount) {
        losingMountLabel = createNode("span", "Missing mount:", "losingMountLabel");
        losingMountSpan = createNode("span",  status.losingMount, "losingMount");

        nodes.push(losingMountLabel, losingMountSpan);
    }

    if (!seen(episode.id)) {
        let showButton = createNode("span", "SHOW", "showButton");
        placingSpan.style.display = "none";
        if (losingMountSpan) losingMountSpan.style.display = "none";
        if (losingMountLabel) losingMountLabel.style.display = "none";
        nodes.push(showButton);

        showButton.addEventListener("click", () => {
            placingSpan.style.display = "inline";
            if (losingMountSpan) losingMountSpan.style.display = "inline";
            if (losingMountLabel) losingMountLabel.style.display = "inline";
            showButton.style.display = "none";
        });
    }

    return nodes;
}


init();
