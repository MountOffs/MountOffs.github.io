let episode = getEpisode();
let player;
console.log(episode);
setHeader(episode.date);
initIframeAPI();


function initIframeAPI() {
    let tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

setInterval(update, 500);

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
    console.log(time);
    return episode.events.slice().reverse().find(event => transformTime(event.time) <= time && event.event === type);
}

function update() {
    if (!player) return;

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
    //console.log("player ready", event);
}

function onPlayerStateChange(event) {
    //console.log("player state change", event);
}

function getId() {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    return urlParams.get("id");
}

function getEpisode() {
    return data.filter(entry => entry.id === getId())[0];
}

function setHeader(header) {
    document.getElementById("header").innerText = header;
}

function setMount(mount) {
    document.getElementById("mount").innerText = mount || "";
}

function setPlayers(players) {
    document.getElementById("players").innerText = players || "";
}