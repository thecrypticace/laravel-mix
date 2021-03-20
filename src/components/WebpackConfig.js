let merge = require('../builder/MergeWebpackConfig');
let webpack = require('webpack');

/** @typedef {import('webpack').Configuration} Configuration */
/** @typedef {import('webpack')} webpack */

class WebpackConfig {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     *
     * @param {((webpack: webpack, config: Configuration) => Configuration)|Configuration} config
     */
    register(config) {
        this.context.api.override(webpackConfig => {
            config =
                typeof config == 'function' ? config(webpack, webpackConfig) : config;

            Object.assign(webpackConfig, merge(webpackConfig, config));
        });
    }
}

module.exports = WebpackConfig;
