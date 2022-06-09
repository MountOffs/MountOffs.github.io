let episode = getEpisode();
let player;
let mountDisplayId = null;

const DEFAULT_PHASE_EVENT = {
    "phase": "ELIMINATION",
    "left": "",
    "right": ""
};

const DEFAULT_SCORE_EVENT = {
    "score": "0:0"
};

init();

function init() {
    setTitle();
    initBackButton();
    initUI();
    initIframeAPI();
}

function initBackButton() {
    let back = document.getElementById("back");
    back.href = "index.html#play";
}

function initUI() {
    document.getElementById("progressContainer").style.display = isLoggedIn() ? "block" : "none";
}

function initIframeAPI() {
    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getEvent(type) {
    let time = player.getCurrentTime();
    return episode.events.slice().reverse().find(event => timeToSeconds(event.time) <= time && event.event === type);
}

function update() {
    if (!player) return;

    if (!episode.events) return;

    let mount = getEvent("MOUNT");
    let players = getEvent("PLAYER");
    let phase = getEvent("PHASE") || DEFAULT_PHASE_EVENT;
    let score = getEvent("SCORE") || DEFAULT_SCORE_EVENT;
    let victory = getEvent("VICTORY");

    if (mount) {
        setMount(mount.mount);
    } else {
        setMount("-");
    }

    setPhase(phase, players, score.score);

    if (victory) {
        setWinner(victory.winner);
        setEpisodeSeen(episode.id);
    } else {
        setWinner();
    }

    if (isLoggedIn()) {
        updateProgress();
    }
}

function currentPlacing(status) {
    if (status.phase === "ELIMINATION") {
        if (status.placing === 1) {
            return "VICTORY";
        } else {
            return "TOP " + status.placing;
        }
    } else {
        return status.phase;
    }
}

function updateProgress() {
    getMounts().then(mounts => {
        let placingPanel = document.getElementById("placing");

        let status = evaluateCurrent(mounts);

        let placing = currentPlacing(status);

        placingPanel.innerText = placing;
        placingPanel.dataset.place = status.losingMount ? placing : "";

        let missingMountContainer = document.getElementById("missingMountContainer");
        if (status.losingMount) {
            missingMountContainer.style.display = "block";
            let missingMount = document.getElementById("missingMount");
            missingMount.innerText = status.losingMount;
        } else {
            missingMountContainer.style.display = "none";
        }
    });
}

function evaluateCurrent(mounts) {
    let policy = OBTAINABILITY_ALL; // getMountPolicy();
    return evaluateEpisode(episode, mounts, policy, player.getCurrentTime());
}

function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame API ready");
    player = new YT.Player('player', {
        height: '600',
        width: '800',
        videoId: episode.youtubeId,
        playerVars: {
            'playsinline': 1,
            'modestbranding': 1,
            'start': episode.start || 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
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

function setTitle() {
    let header = "Episode " + episode.id;
    document.getElementById("header").innerText = header;
    document.title = header + " | Mount Offs";
}

function setWinner(winner = null) {
    let hasWinner = (winner !== null);

    if (hasWinner) {
        document.getElementById("scoreContainer").style.display = "none";
        document.getElementById("winner").innerText = winner;
    }

    document.getElementById("winnerContainer").style.display = hasWinner ? "block": "none";
}

function setPlayers(players) {
    document.getElementById("stage").innerText = ("TOP " + players) || "";
}

function setPhase(phase, players, score) {
    let final = phase.phase !== "ELIMINATION";

    let stageSpan = document.getElementById("stage");

    if (!final) {
        if (players) {
            stageSpan.innerText = "TOP " + players.players;
        } else {
            stageSpan.innerText = "-";
        }
    } else {
        stageSpan.innerText = phase.phase;
    }

    document.getElementById("scoreContainer").style.display = final ? "block" : "none";
    document.getElementById("score").innerText = score;
    document.getElementById("left").innerText = phase.left;
    document.getElementById("right").innerText = phase.right;
}

function factionId() {
    return episode.faction === "horde" ? 1 : 0;
}

function setMount(mount) {
    let mountPanel = document.getElementById("mount");
    mountPanel.innerText = mount || "";

    let modelContainer = document.querySelector('#model_3d');
    let modelMissing = document.querySelector("#modelMissing");

    if (mount !== '-') {
        let config = mountMapping[mount];
        if (!config) {
            console.warn("Display ID missing for " + mount);
            modelContainer.innerHTML = "";
            modelMissing.style.display = "block";
            return;
        }

        modelMissing.style.display = "none";

        let displayId = config.displayId;

        if (displayId instanceof Array) {
            displayId = displayId[factionId()];
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