let scripted = episodes.filter(e => e.status === "done").length;

document.querySelector("#scripted").innerText = scripted;
document.querySelector("#total").innerText = episodes.length;