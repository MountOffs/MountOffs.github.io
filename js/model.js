if (!window.WH) {
    window.WH = {};
    window.WH.debug = function (...args) {
        console.debug(args);
    };
    window.WH.defaultAnimation = `Stand`;
}

// eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        container: jQuery(containerSelector),
        aspect: aspect,
        hd: true,
        ...modelOptions
    };
    window.models = models;

    // eslint-disable-next-line no-undef
    return new WowModelViewer(models);
}