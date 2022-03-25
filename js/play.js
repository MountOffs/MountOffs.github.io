let list = document.getElementById("list");

episodes.filter(entry => entry.status === "done").forEach(entry => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(entry.date);
    a.appendChild(text);
    a.title = entry.date;
    a.href = "/mountoffs/episode.html?id=" + entry.id;

    li.appendChild(a);
    list.appendChild(li);
});