let list = document.getElementById("episodes");

episodes.filter(e => e.status === "done").forEach(episode => {
    let div = document.createElement("div");
    div.classList.add("gallery-cell");
    let a = document.createElement("a");
    let text = document.createTextNode(episode.date);
    a.appendChild(text);
    a.title = episode.date;
    a.href = "/mountoffs/episode.html?id=" + episode.id;

    div.appendChild(a);
    list.appendChild(div);
});