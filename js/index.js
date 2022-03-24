let ul = document.getElementById("list");

function getClass(entry) {
    switch (entry.status) {
        case "done": return "done";
        case "wip": return "wip";
        default: return "broken";
    }
}

data.forEach(entry => {
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

window.addEventListener('DOMContentLoaded', (event) => {
    getMounts("eu", "twisting-nether", "treogfyrre", (data) => {
        console.log(data);
    });
});