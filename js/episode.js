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

function getTimepoint() {
    let time = player.getCurrentTime();

    return episode.timepoints.slice().reverse().find(timepoint => timepoint.timestamp <= time);
}

function update() {
    let timepoint = getTimepoint();
    console.log(timepoint);
    setMount(timepoint.mount);
    setPlayers(timepoint.players);
}

function onYouTubeIframeAPIReady() {
    console.log("YouTube IFrame API ready");
    player = new YT.Player('player', {
        height: '600',
        width: '800',
        videoId: episode.youtubeId,
        playerVars: {
            'playsinline': 1
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