function isLoggedIn() {
    let region = getLocalStorage("region");
    let realm = getLocalStorage("realm");
    let char = getLocalStorage("character");
    return region != null && realm != null && char != null;
}

function createNode(type, text, ...clazzes) {
    let node = document.createElement(type);
    let textNode = document.createTextNode(text);
    node.appendChild(textNode);
    clazzes.forEach(clazz => {
        node.classList.add(clazz);
    });
    return node;
}

function removeLocalStorage(key) {
    key = "_" + key;
    localStorage.removeItem(key);
}

function cacheMounts(mounts) {
    setLocalStorage("mounts", mounts, 24 * 60 * 60 * 1000);
}