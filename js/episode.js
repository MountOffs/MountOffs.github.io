let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let id = urlParams.get("id");

let episode = data.filter(entry => entry.id === id)[0];
console.log(episode);

document.getElementById("header").innerText = episode.date;

let container = document.getElementById("container");
let embed = document.createElement("iframe");
embed.width = "800";
embed.height = "600";
embed.src = episode.url.replace("watch?v=", "embed/");

container.appendChild(embed);