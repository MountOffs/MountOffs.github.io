let episode = getEpisode();
let player;
let timeDiv = document.querySelector("#time");
let configDiv = document.querySelector("#config");

const DEFAULT_SCORE_EVENT = {
    "score": "0:0"
};

init();

function init() {
    setHeader("Episode " + episode.id);
    initBackButton();
    initIframeAPI();
    initConfig();
}

function initConfig() {
    episode.events = [];
    episode.events.push({"time": "0:00", "event": "PLAYER", "players": 39})
}

function initBackButton() {
    let back = document.getElementById("back");
    if (episode.status === "done") {
        back.href = "play.html";
    } else {
        back.href = "archive.html";
    }
}

function initIframeAPI() {
    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getTime() {
    let time = player.getCurrentTime();
    let timestamp = secondsToTime(Math.floor(time));
    if (timestamp.startsWith("00:")) {
        return timestamp.substring(3);
    }
}

function displayEpisodeConfig() {
    let episodes = episode.events.map(e => JSON.stringify(e)).join(",<br/>");
    configDiv.innerHTML = episodes;
}

function update() {
    timeDiv.innerText = getTime();
    displayEpisodeConfig();
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

function initKeyPressListener() {
    window.addEventListener("keyup", e => {
        console.log("Keypress: " + e.code);
        if (e.code === "Space") {
            togglePlay();
        }

        if (e.code === "Minus") {
            playerEvent(-1);
        }

        if (e.code === "Equal") {
            playerEvent(+1);
        }

        if (e.code === "Digit1") {
            scoreEvent("left");
        }

        if (e.code === "Digit2") {
            scoreEvent("right");
        }

        if (e.code === "KeyR") {
            resetScoreEvent();
        }

        if (e.code === "KeyM") {
            mountEvent();
        }

        if (e.code === "KeyV") {
            victoryEvent();
        }

        if (e.code === "Backspace") {
            deleteEvent();
        }
    });
}

function deleteEvent() {
    episode.events.splice(-1);
}

function addEvent(event) {
    episode.events.push(event);
    console.log(event);
}

function createEvent(type) {
    return {
        "time": getTime(),
        "event": type
    };
}

function victoryEvent() {
    let event = createEvent("VICTORY");
    event.winner = "";
    addEvent(event);
}

function mountEvent() {
    let event = createEvent("MOUNT");
    event.mount = "";
    addEvent(event);
}

function resetScoreEvent() {
    let event = createEvent("SCORE");
    event.score = "0:0";
    addEvent(event);
}

function scoreEvent(player) {
    let score = getScore();
    score[player]++;
    let event = createEvent("SCORE");
    event.score = score.left + ":" + score.right;
    addEvent(event);
}

function getEvent(type) {
    let time = player.getCurrentTime();
    return episode.events.slice().reverse().find(event => timeToSeconds(event.time) <= time && event.event === type);
}

function getScore() {
    let event = getEvent("SCORE") || DEFAULT_SCORE_EVENT;
    let parts = event.score.split(":");
    return {
        "left": parseInt(parts[0]),
        "right": parseInt(parts[1])
    };
}

function playerEvent(delta) {
    let players = getEvent("PLAYER")?.players || 39;
    let event = createEvent("PLAYER");
    event.players = players + delta;
    addEvent(event);
}

function togglePlay() {
    if (player.getPlayerState() === 1) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function onPlayerReady(event) {
    setInterval(update, 200);
    initKeyPressListener();
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