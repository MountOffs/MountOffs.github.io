let episode = getEpisode();
let player;
let mountDisplayId = null;

init();

function init() {
    setHeader(episode.date);
    initBackButton();
    initUI();
    initIframeAPI();
}

function initBackButton() {
    let back = document.getElementById("back");
    if (episode.status === "done") {
        back.href = "play.html";
    } else {
        back.href = "archive.html";
    }
}

function initUI() {
    let enable = (episode.status === "done" || episode.status === "WIP");
    document.getElementById("mountContainer").style.display = enable ? "block" : "none";
    document.getElementById("playersContainer").style.display = enable ? "block" : "none";
    document.getElementById("progressContainer").style.display = enable && isLoggedIn() ? "block" : "none";
}

function initIframeAPI() {
    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getEvent(type) {
    let time = player.getCurrentTime();
    return episode.events.slice().reverse().find(event => transformTime(event.time) <= time && event.event === type);
}

function update() {
    if (!player) return;

    if (!episode.events) return;

    let mount = getEvent("MOUNT");
    let players = getEvent("PLAYER");

    if (mount) {
        setMount(mount.mount);
    } else {
        setMount("-");
    }

    if (players) {
        setPlayers(players.players);
    } else {
        setPlayers("-");
    }

    if (isLoggedIn()) {
        updateProgress();
    }
}

function updateProgress() {
    getMounts(mounts => {
        let placingPanel = document.getElementById("placing");

        let state = evaluateCurrent(mounts);

        placingPanel.innerText = state.placing;
        placingPanel.dataset.place = state.placing;

        let missingMountContainer = document.getElementById("missingMountContainer");
        if (state.losingMount) {
            missingMountContainer.style.display = "block";
            let missingMount = document.getElementById("missingMount");
            missingMount.innerText = state.losingMount;

            document.getElementById("progressContainer").dataset.lost = "1";
        } else {
            missingMountContainer.style.display = "none";
            document.getElementById("progressContainer").dataset.lost = "0";
        }
    });
}

function evaluateCurrent(mounts) {
    return evaluateEpisode(episode, mounts, player.getCurrentTime());
}

function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame API ready");
    player = new YT.Player('player', {
        height: '600',
        width: '800',
        videoId: episode.youtubeId,
        playerVars: {
            'playsinline': 1,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    setInterval(update, 500);
}

function onPlayerStateChange(event) {
}

function getId() {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    return urlParams.get("id");
}

function getEpisode() {
    return episodes.filter(entry => entry.id === getId())[0];
}

function setHeader(header) {
    document.getElementById("header").innerText = header;
}

function setMount(mount) {
    let mountPanel = document.getElementById("mount");
    mountPanel.innerText = mount || "";

    let modelContainer = document.querySelector('#model_3d');

    if (mount !== '-') {
        let displayId = mountMapping[mount];
        if (!displayId) {
            console.warn("Display ID missing");
            modelContainer.innerHTML = "MODEL MISSING";
            return;
        }

        if (displayId instanceof Array) {
            displayId = displayId[0];
        }

        if (mountDisplayId !== displayId) {
            modelContainer.innerHTML = "";
            mountDisplayId = displayId;
            generateModel(displayId);
        }
    } else {
        modelContainer.innerHTML = "";
    }
}

function setPlayers(players) {
    document.getElementById("players").innerText = players || "";
}