const config = document.querySelector("#config");

let prefix = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
let postfix = "</urlset>";

let lastmod = "2022-06-05T00:00:00+02:00";

document.querySelector("#copyBtn").addEventListener("click", () => navigator.clipboard.writeText(config.innerText));

generateSitemap();

function entry(url, priority) {
    let loc = "https://mountoffs.com/" + url;
    return "<url>\n" +
        "<loc>" + loc + "</loc>\n" +
        "<lastmod>" + lastmod + "</lastmod>\n" +
        "<priority>"+ priority + "</priority>\n" +
        "</url>\n"
}

function generateSitemap() {
    let sitemap = prefix;
    sitemap+=entry("#about", 1);
    sitemap+=entry("#play", 0.8);
    episodes.forEach(episode => {
        sitemap+=entry("episode.html?id=" + episode.id, 0.5);
    });
    sitemap += postfix;
    config.innerText = sitemap;
}

