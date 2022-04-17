let char = localStorage.getItem("character");

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

document.querySelector('h2').innerText = "Welcome, " + capitalize(char);

getMounts(mounts => {
    document.querySelector("#mounts").innerText = "You have " + mounts.length + " mounts";
});
