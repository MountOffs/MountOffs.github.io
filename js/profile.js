let char = localStorage.getItem("character");
const episodeGrid = document.querySelector("#episodesGrid");

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function logout() {
    localStorage.removeItem("region");
    localStorage.removeItem("realm");
    localStorage.removeItem("character");
    localStorage.removeItem("mounts");

    location.href = "about.html";
}

document.querySelector('#name').innerText = capitalize(char);
document.querySelector("#logout").addEventListener("click", () => {
   logout();
});

function seen(episode) {
    let seen = localStorage.getItem("episode" + episode.id + "_seen");
    return seen !== null;
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

    if (!seen(episode)) {
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

getMounts(mounts => {
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