function getMounts(region, realm, character, callback) {
    fetchMounts(region, realm, character, (response) => {
        let data = JSON.parse(response);
        let mounts = data.mounts.map(mount => mount.mount.name);
        callback(mounts);
    });
}