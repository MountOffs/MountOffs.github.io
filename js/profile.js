let char = localStorage.getItem("character");

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function logout() {
    localStorage.removeItem("region");
    localStorage.removeItem("realm");
    localStorage.removeItem("character");
    localStorage.removeItem("mounts");

    location.href = "about.html";
}

document.querySelector('h2').innerText = "Welcome, " + capitalize(char);
document.querySelector("#logout").addEventListener("click", () => {
   logout();
});

getMounts(mounts => {
    document.querySelector("#mounts").innerText = "You have " + mounts.length + " mounts";
});