if (!window.WH) {
    window.WH = {};
    window.WH.debug = function (...args) {
        console.debug(args);
    };
    window.WH.defaultAnimation = `Stand`;
}

class WowModelViewer extends ZamModelViewer {
    getListAnimations() {
        return [...new Set(this.renderer.models[0].an.map(e => e.j))];
    }

    /**
     * Change character distance
     * @param {int} val
     */
    setDistance(val) {
        this.renderer.distance = val;
    }

    setFullscreen(val) {
        super.setFullscreen(val);
    }

    /**
     * Change the animation
     * @param {string} val
     */
    setAnimation(val) {
        if (!this.getListAnimations().includes(val)) {
            console.warn(`${this.constructor.name}: Animation ${val} not found`);
        }
        this.renderer.models[0].setAnimation(val);
    }

    /**
     * Play / Pause the animation
     * @param {boolean} val
     */
    setAnimPaused(val) {
        this.renderer.models[0].setAnimPaused(val);
    }
}

function generateModel(modelId, aspect = 1, containerSelector = '#model_3d') {
    const modelOptions = {
        models: {
            type: 8,
            id: modelId
        }
    };

    const models = {
        type: 2,
        contentPath: `https://wow.zamimg.com/modelviewer/live/`,
        container: jQuery(containerSelector),
        aspect: aspect,
        hd: true,
        ...modelOptions
    };
    window.models = models;

    let viewer = new WowModelViewer(models);
    let canvas = viewer.renderer.canvas[0];
    $(canvas).off("dblclick mousedown mousemove mouseup DOMMouseScroll touchend touchmove touchstart");

    let timeout;

    $(canvas).on("click", () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        let mountSpecialDuration = viewer.renderer.models[0].an.filter(animation => animation.j === "MountSpecial")[0].g;
        let animationOffset = -100;
        viewer.renderer.models[0].setAnimation("MountSpecial");

        timeout = setTimeout(() => {
            viewer.renderer.models[0].setAnimation("Stand");
        }, mountSpecialDuration + animationOffset);
    });

    return viewer;
}