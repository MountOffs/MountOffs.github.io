let list = document.getElementById("episodes");

episodes.filter(e => e.status === "done").forEach(episode => {
    let div = document.createElement("div");
    div.classList.add("gallery-cell");
    setBackground(div, episode);

    let backdrop = document.createElement("div");
    backdrop.classList.add("backdrop");
    div.appendChild(backdrop);

    let a = document.createElement("a");
    let text = document.createTextNode("Episode " + episode.id);
    a.appendChild(text);
    a.title = episode.date;
    a.href = "episode.html?id=" + episode.id;

    div.appendChild(a);
    list.appendChild(div);
});

function setBackground(div, episode) {
    let imgUrl = "url('https://i.ytimg.com/vi/" + episode.youtubeId + "/hqdefault.jpg')";
    div.style.background = imgUrl + " center";
}