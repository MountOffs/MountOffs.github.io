console.log("Initialize");

let ul = document.getElementById("list");

data.forEach(entry => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(entry.date);
    a.appendChild(text);
    a.title = entry.date;
    a.href = entry.url;

    li.appendChild(a);

    ul.appendChild(li);
});