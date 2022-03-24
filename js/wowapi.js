const urlTemplate = (region, realm, character, locale, token) => `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}/collections/mounts?namespace=profile-${region}&locale=${locale}&access_token=${token}`;

function locale(region) {
    switch (region) {
        case "eu": return "en_GB";
        case "us": return "en_US";
        default: return "en_GB";
    }
}

function setCookieToken(token, expires) {
    let date = new Date();
    date.setTime(date.getTime() + expires * 1000);
    document.cookie = 'token=' + (token || "") + "; expires=" + date.toUTCString();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCookieToken() {
    return getCookie("token");
}

function getToken(callback) {
    let token = getCookieToken();
    if (!token) {
        authorize((response) => {
            let payload = JSON.parse(response);
            token = payload.access_token;
            let expires = payload.expires_in;
            setCookieToken(token, expires);

            callback(token);
        });
    } else {
        callback(token);
    }
}

function authorize(callback) {
    post("https://us.battle.net/oauth/token", (response) => {
        callback(response);
    })
}

function post(url, callback) {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    const digest = "YzI3NGFjOGFmM2Q2NDgyMDliMjQ1NzBhZTBkOWFkY2I6Vjh4cndIZ2JmcjV4Nk4xWHZnREFVYzNscHhKN3prWHg=";
    request.setRequestHeader("Authorization", "Basic " + digest);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("grant_type=client_credentials");

    request.onreadystatechange = (e) => {
        if (request.readyState === 4) {
            callback(request.response);
        }
    };
}

function fetchMounts(region, realm, character, callback) {
    getToken((token) => {
        let url = urlTemplate(region, realm, character, locale(region), token);
        get(url, callback);
    });
}

function get(url, callback) {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.send();

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            callback(request.response);
        }
    };
}

