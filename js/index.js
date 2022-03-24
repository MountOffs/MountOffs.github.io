let ul = document.getElementById("list");

data.forEach(entry => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(entry.date);
    a.appendChild(text);
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