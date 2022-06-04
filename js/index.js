function init() {

    createLoginDialog();

    document.querySelector("#about-anchor").addEventListener("click", () => switchPage("#about"));
    document.querySelector("#play-anchor").addEventListener("click", () => switchPage("#play"));
    document.querySelector("#profile-anchor").addEventListener("click", () => switchPage("#profile"));
    document.querySelector("#login-button").addEventListener("click", () => {
        const modal = document.querySelector('#loginModal');
        modal.showModal();
    });

    document.querySelector("#about-play-link").addEventListener("click", () => switchPage("#play"));

    initSplash();

    switchPage(currentPage());
}

function initSplash() {
    let splashSeen = getLocalStorage("splashSeen");
    document.querySelector(".splashOverlay").style.display = splashSeen ? "none" : "block";
    document.querySelector(".enter").addEventListener("click", closeSplash);
}

let flkty;

function closeSplash() {
    setLocalStorage("splashSeen", true);
    document.querySelector(".splashOverlay").style.display = "none";
}

function initPlay() {
    if (!flkty) {
        //for initial DOM loading on #play
        document.addEventListener("DOMContentLoaded", () => {
            flkty = new Flickity("#episodes", {"wrapAround": true});
        });

        //for lazy loading when switching to play
        flkty = new Flickity("#episodes", {"wrapAround": true});
    }
}

function switchPage(page) {
    updateNavbar(page);

    let pages = document.querySelectorAll(".page");
    pages.forEach(page => {
        page.style.display = "none";
    });

    let currentPageId = page + "-page";
    let currentPage = document.querySelector(currentPageId);
    currentPage.style.display = "block";

    let footer = document.querySelector(".footer");
    footer.style.display = (page === "#profile") ? "none" : "flex";

    if (page === "#play") {
        initPlay();
    } else if (page === "#profile") {
        initProfile();
    }
}

function currentPage() {
    if (!document.location.hash) {
        return "#about";
    }
    return document.location.hash; //i.e. #about
}

function updateNavbar(page) {
    console.log("Update navbar: " + page);
    let links = document.querySelectorAll(".links > a");
    links.forEach(link => {
        link.classList.remove("current");
    });

    let current = document.querySelector(page + "-anchor");
    current.classList.add("current");

    let profile = document.querySelector("#profile-anchor");
    let login = document.querySelector("#login-button");

    profile.style.display = isLoggedIn() ? "inline" : "none";
    login.style.display = isLoggedIn() ? "none" : "inline";
}

init();
