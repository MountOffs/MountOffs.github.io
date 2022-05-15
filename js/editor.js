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
    initCopyButton();
}

function initConfig() {
    if (!episode.events) {
        episode.events = [];
        episode.events.push({"time": "0:00", "event": "PLAYER", "players": 39})
    }
}

function copyConfig() {
    navigator.clipboard.writeText(episodeConfigToResult()).then(function() {
        console.log("Copied successfully");
    }, (e) => {
        console.error("Couldn't copy to clipboard", e);
    });
}

function initBackButton() {
    let back = document.getElementById("back");
    if (episode.status === "done") {
        back.href = "play.html";
    } else {
        back.href = "archive.html";
    }
}

function initCopyButton() {
    document.querySelector("#copyBtn").addEventListener("click", copyConfig);
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

function episodeConfigToResult() {
    return episode.events.map(e => JSON.stringify(e)).join(",\n");
}

function eventString(event) {
    let value = null;
    switch (event.event) {
        case "PLAYER": value = event.players; break;
        case "MOUNT": value = event.mount; break;
        case "SCORE": value = event.score; break;
        case "PHASE": value = event.phase; break;
        case "VICTORY": value = event.winner; break;
    }
    return "[" + event.time + " - " + event.event + (value ? (" - " + value) : "") + "]";
}

function episodeConfigToHTML() {
    return episode.events.slice().reverse().map(eventString).join(",<br/>");
}

function update() {
    timeDiv.innerText = getTime();
    configDiv.innerHTML = episodeConfigToHTML();
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
    //Prevent scrolling
    window.addEventListener("keydown", e => {
        if (["Space", "ArrowUp", "ArrowDown"].indexOf(e.code) >= 0 && e.target === document.body) {
            e.preventDefault();
        }
    });

    window.addEventListener("keyup", e => {
        console.log("Keypress: " + e.code);
        if (e.code === "Space") {
            togglePlay();
            e.preventDefault();
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

        if (e.code === "KeyP") {
            phaseEvent();
        }

        if (e.code === "Backspace") {
            deleteEvent();
        }

        if (e.code === "ArrowLeft") {
            scrollVideo(-5);
        }

        if (e.code === "ArrowRight") {
            scrollVideo(+5)
        }

        if (e.code === "ArrowUp") {
            scrollToEvent(false);
        }

        if (e.code === "ArrowDown") {
            scrollToEvent(true);
        }
    });
}

function phaseEvent() {
    let currentPhase = getEvent("PHASE")?.phase;
    if (currentPhase === "GRANDFINAL") return;

    let event = createEvent("PHASE");

    if (currentPhase === "FINAL") {
        event.phase = "GRANDFINAL";
    } else {
        event.phase = "FINAL";
    }

    addEvent(event);
}

function scrollToEvent(forward) {
    if (forward) {
        let time = getNextEvent("MOUNT")?.time || "0:00";
        player.seekTo(timeToSeconds(time), true);
    } else {
        let time = getEvent("MOUNT", 0.5)?.time || "0:00";
        player.seekTo(timeToSeconds(time), true);
    }
}

function scrollVideo(delta) {
    let time = player.getCurrentTime() + delta;
    player.seekTo(time, true);
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

function getEvent(type = null, epsilon = 0) {
    let time = player.getCurrentTime();
    return episode.events.slice().reverse().find(event => {
        let eventTime = timeToSeconds(event.time);
        if (type && event.event !== type) return false;

        if (time < eventTime) return false;

        return time - eventTime >= epsilon;

    });
}

function getNextEvent(type = null) {
    let time = player.getCurrentTime();
    return episode.events.find(event => {
        let eventTime = timeToSeconds(event.time);
        if (type && event.event !== type) return false;

        console.log(event);
        console.log(time + " vs " + eventTime);

        return time <= eventTime;

    });
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

function onPlayerReady() {
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