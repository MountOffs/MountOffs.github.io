let list = document.querySelector("#episodes");

episodes.forEach(episode => {
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
    div.style["background-image"] = "url('https://i.ytimg.com/vi/" + episode.youtubeId + "/hqdefault.jpg')";
}