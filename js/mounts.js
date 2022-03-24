function getMounts(region, realm, character, callback) {
    fetchMounts(region, realm, character, (response) => {
        let data = JSON.parse(response);
        let mounts = data.mounts.map(mount => mount.mount.name);
        callback(mounts);
    });
}

let mounts;

function hasMount(mount) {
    return mounts.indexOf(mount) > -1;
}

window.addEventListener('DOMContentLoaded', (event) => {
    // getMounts("eu", "twisting-nether", "treogfyrre", (data) => {
    //     mounts = data;
    // });
});