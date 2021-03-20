class SetResourceRoot {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     *
     * @param {string} path
     */
    register(path) {
        this.context.config.resourceRoot = path;
    }
}

module.exports = SetResourceRoot;
