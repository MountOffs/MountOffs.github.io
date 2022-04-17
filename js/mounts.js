function getMounts(callback) {
    if (!isLoggedIn()) {
        callback([]);
        return;
    }

    let mounts = JSON.parse(localStorage.getItem("mounts"));
    if (mounts) {
        callback(mounts);
        return;
    }

    let region = localStorage.getItem("region");
    let realm = localStorage.getItem("realm");
    let char = localStorage.getItem("character");
    fetchMounts(region, realm, char, (mounts) => {
        localStorage.setItem("mounts", JSON.stringify(mounts));
        callback(mounts);
    });
}

function hasMount(mounts, mount) {
    return mounts.indexOf(mount) > -1;
}