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
}

function initIframeAPI() {
    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function transformTime(time) {
    let parts = time.split(":");
    if (parts.length === 3) {
        return parts[0] * 60 * 60 + parts[1] * 60 + parts[2] * 1;
    } else {
        return parts[0] * 60 + parts[1] * 1;
    }
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
    let mount = getEvent("MOUNT")?.mount;
    getMounts(mounts => {
        let mountPanel = document.getElementById("mount");
        mountPanel.classList.remove("obtained", "missing");
        if (mount) {
            if (hasMount(mounts, mount)) {
                mountPanel.classList.add("obtained");
            } else {
                mountPanel.classList.add("missing");
            }
        }

        let current = evaluateCurrent(mounts);
        console.log("Current:", current);

        let state = evaluateEpisode(episode, mounts);
        console.log("State:", state);
    });
}

function evaluateEpisode(episode, mounts, time = Number.POSITIVE_INFINITY) {
    if (!episode.events) {
        return null;
    } else {
        let placing = 0;
        let losingMount = null;
        let missingMounts = [];
        episode.events.forEach(event => {
            if (transformTime(event.time) > time) {
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
            }
        });

        return {
            "phase": null,
            "placing": placing,
            "losingMount": losingMount,
            "missingMounts": missingMounts
        }
    }
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
        if (displayId && mountDisplayId !== displayId) {
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