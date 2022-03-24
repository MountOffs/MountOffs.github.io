let ul = document.getElementById("list");

function getClass(entry) {
    switch (entry.status) {
        case "done": return "done";
        case "wip": return "wip";
        default: return "broken";
    }
}

episodes.forEach(entry => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(entry.date);
    a.appendChild(text);
    a.classList.add(getClass(entry));
    a.title = entry.date;
    a.href = "/mountoffs/episode.html?id=" + entry.id;

    li.appendChild(a);

    ul.appendChild(li);
});