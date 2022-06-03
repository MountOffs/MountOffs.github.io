function init() {
    if (document.querySelector(".page")) {
        switchPage(currentPage());
        document.body.appendChild(createLoginDialog());
    }

    document.querySelector("#about-anchor").addEventListener("click", () => switchPage("#about"));
    document.querySelector("#play-anchor").addEventListener("click", () => switchPage("#play"));
    document.querySelector("#profile-anchor").addEventListener("click", () => switchPage("#profile"));
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
}

function currentPage() {
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

    if (!isLoggedIn()) {
        let links = document.querySelector(".links");
        let profile = document.querySelector("#profile");
        profile.remove();

        links.appendChild(createLoginBtn());
    }
}

init();
