let path = require('path');
let File = require('./File');

module.exports = class HotReloading {
    /** @param {ReturnType<import("./config.js")>} config */
    constructor(config) {
        this.config = config;
    }

    record() {
        this.clean();

        if (!this.config.hmr) {
            return;
        }

        this.hotFile().write(
            `${this.http()}://${this.config.hmrOptions.host}:${this.port()}/`
        );
    }

    hotFile() {
        return new File(path.join(this.config.publicPath, 'hot'));
    }

    http() {
        return process.argv.includes('--https') ? 'https' : 'http';
    }

    port() {
        return this.config.hmrOptions.port;
    }

    clean() {
        this.hotFile().delete();
    }
};
