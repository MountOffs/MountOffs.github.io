let char = localStorage.getItem("character");
const episodeUl = document.querySelector("#episodes");
const progress = document.querySelector("#progress");
const progressBar = document.querySelector("#progressBar");

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

function placePrefix(place) {
    if (place % 100 !== 10) {
        if (place % 10 === 1) {
            return "st";
        } else if (place % 10 === 2) {
            return "nd";
        } else if (place % 10 === 3) {
            return "rd";
        }
    }

    return "th";
}

function placeToString(place) {
    if (place === 1) {
        return "VICTORY";
    }

    return place + placePrefix(place) + " place";
}

function seen(episode) {
    let seen = localStorage.getItem("episode" + episode.id + "_seen");
    return seen !== null;
}

function createEpisodeStatus(episode, status) {
    let li = document.createElement("li");
    let episodeSpan = createNode("span", "Episode " + episode.id, "episode");
    let placingSpan = createNode("span", placeToString(status.placing), "place");
    placingSpan.dataset.place = status.placing;
    li.append(episodeSpan, placingSpan);

    let losingMountLabel;
    let losingMountSpan;

    if (status.placing !== 1) {
        losingMountLabel = createNode("span", "Missing mount:", "losingMountLabel");
        losingMountSpan = createNode("span",  status.losingMount, "losingMount");

        li.append(losingMountLabel, losingMountSpan);
    }

    if (!seen(episode)) {
        let showButton = createNode("span", "SHOW", "showButton");
        placingSpan.style.display = "none";
        if (losingMountSpan) losingMountSpan.style.display = "none";
        if (losingMountLabel) losingMountLabel.style.display = "none";
        li.append(showButton);

        showButton.addEventListener("click", () => {
            placingSpan.style.display = "inline";
            if (losingMountSpan) losingMountSpan.style.display = "inline";
            if (losingMountLabel) losingMountLabel.style.display = "inline";
            showButton.style.display = "none";
        });
    }

    return li;
}

getMounts(mounts => {
    let victories = 0;
    let total = 0;
    episodes.forEach(episode => {
        let status = evaluateEpisode(episode, mounts);
        if (status) {
            let node = createEpisodeStatus(episode, status);
            episodeUl.appendChild(node);

            total++;
            if (status.placing === 1) {
                victories++;
            }
        }
    });

    //progress.innerText = "Progress: " + victories + "/" + total;
    //progressBar.value = victories;
    //progressBar.max = total;
});