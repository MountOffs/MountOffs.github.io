let episode = getEpisode();
let player;
let mountDisplayId = null;

const ELIMINATION_PHASE = {
    "phase": "ELIMINATION",
    "left": "",
    "right": ""
};

const DEFAULT_SCORE = "0:0";

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
    let phase = getEvent("PHASE");
    let score = getEvent("SCORE");

    if (mount) {
        setMount(mount.mount);
    } else {
        setMount("-");
    }

    setPhase(phase || ELIMINATION_PHASE, score?.score || DEFAULT_SCORE);

    if (players) {
        setPlayers(players.players);
        if (players.players === 1) {
            setEpisodeSeen();
        }
    } else {
        setPlayers("-");
    }

    if (isLoggedIn()) {
        updateProgress();
    }
}

function setEpisodeSeen() {
    localStorage.setItem("episode" + episode.id + "_seen", "1");
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

function setPhase(phase, score) {
    let final = phase.phase !== "ELIMINATION";

    document.getElementById("scoreContainer").style.display = final ? "block" : "none";
    document.getElementById("score").innerText = score;
    document.getElementById("left").innerText = phase.left;
    document.getElementById("right").innerText = phase.right;
}

function setMount(mount) {
    let mountPanel = document.getElementById("mount");
    mountPanel.innerText = mount || "";

    let modelContainer = document.querySelector('#model_3d');
    let modelMissing = document.querySelector("#modelMissing");

    if (mount !== '-') {
        let displayId = mountMapping[mount];
        if (!displayId) {
            console.warn("Display ID missing for " + mount);
            modelContainer.innerHTML = "";
            modelMissing.style.display = "block";
            return;
        }

        modelMissing.style.display = "none";

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
        modelMissing.style.display = "none";
    }
}

function setPlayers(players) {
    document.getElementById("players").innerText = players || "";
}