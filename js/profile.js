let char = localStorage.getItem("character");
let m = JSON.parse(localStorage.getItem("mounts"));

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

document.querySelector('h2').innerText = "Welcome, " + capitalize(char);
document.querySelector("#mounts").innerText = "You have " + m.length + " mounts";