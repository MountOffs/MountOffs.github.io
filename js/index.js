let done = document.getElementById("doneList");
let incomplete = document.getElementById("incompleteList");

function getClass(entry) {
    switch (entry.status) {
        case "done": return "done";
        case "wip": return "wip";
        default: return "incomplete";
    }
}

episodes.forEach(entry => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(entry.date);
    a.appendChild(text);
    a.classList.add(getClass(entry));
    a.title = entry.date;
    a.href = "/episode.html?id=" + entry.id;

    li.appendChild(a);

    if (entry.status === "done") {
        done.appendChild(li);
    } else {
        incomplete.appendChild(li);
    }
});