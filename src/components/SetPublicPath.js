let path = require('path');

class SetPublicPath {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     *
     * @param {string} defaultPath
     */
    register(defaultPath) {
        this.context.config.publicPath = path.normalize(defaultPath.replace(/\/$/, ''));
    }
}

module.exports = SetPublicPath;
