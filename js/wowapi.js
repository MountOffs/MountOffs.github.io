const urlTemplate = (region, realm, character, locale, token) => `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${character}/collections/mounts?namespace=profile-${region}&locale=${locale}&access_token=${token}`;

function locale(region) {
    switch (region) {
        case "eu": return "en_GB";
        case "us": return "en_US";
        default: return "en_GB";
    }
}

function getToken(callback) {
    let token = getLocalStorage("token");
    if (!token) {
        authorize((response) => {
            let payload = JSON.parse(response);
            token = payload.access_token;
            let expires = payload.expires_in;
            setLocalStorage("token", token, expires * 1000);

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
    console.log("Fetching mounts");
    getToken((token) => {
        let url = urlTemplate(region, realm, character, locale(region), token);
        get(url, (response) => {
            let data = JSON.parse(response);
            let mounts = data.mounts.map(mount => mount.mount.name);
            mounts = processFactionMounts(mounts);
            console.log("Mounts fetched:", mounts);
            callback(mounts);
        });
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

