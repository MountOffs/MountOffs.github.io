const urlTemplate = (region, realm, character, locale, token) => `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}/collections/mounts?namespace=profile-${region}&locale=${locale}&access_token=${token}`;

function locale(region) {
    switch (region) {
        case "eu": return "en_GB";
        case "us": return "en_US";
        default: return "en_GB";
    }
}

function fetchMounts(region, realm, character, callback) {
    let url = urlTemplate(region, realm, character, locale(region), token);
    console.log(url);
    get(url, callback);
}

function get(url, callback) {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.send();

    request.onreadystatechange = callback;

    request.onreadystatechange = (e) => {
        callback(request.responseText);
    };
}

