const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');
const { getGlobalMix } = require('../MixGlobal');

/**
 * @typedef {object} ESBuildConfig
 * @property {import("esbuild").TransformOptions} [options]
 * @property {"auto" | "minifier-only"} [mode]
 */

class ESBuild {
    constructor() {
        /** @type {ESBuildConfig} */
        this.options = {
            mode: 'auto',
            options: {}
        };
    }

    name() {
        return ['esbuild'];
    }

    /**
     * @param {ESBuildConfig} config
     */
    register(config) {
        this.options = {
            ...this.options,
            ...config
        };

        this.context.esbuild = true;
    }

    webpackConfig() {
        return {
            optimization: {
                minimize: true,
                minimizer: [
                    new ESBuildMinifyPlugin({
                        target: 'es2015' // Syntax to compile to (see options below for possible values)
                    })
                ]
            }
        };
    }

    webpackPlugins() {
        return [new ESBuildPlugin()];
    }

    webpackRules() {
        if (this.options.mode === 'minifier-only') {
            return [];
        }

        /**
         *
         * @param {RegExp} test
         * @param {string} loader
         */
        const buildRule = (loader, test) => {
            return {
                test,
                loader: 'esbuild-loader',
                exclude: /(node_modules|bower_components)/,
                options: {
                    loader,
                    ...this.options.options
                }
            };
        };

        return [
            buildRule('js', /\.[cm]?js$/),
            buildRule('ts', /\.ts$/),
            buildRule('jsx', /\.jsx$/),
            buildRule('tsx', /\.tsx$/)
        ];
    }

    get context() {
        return getGlobalMix({ warn: false });
    }
}

module.exports = ESBuild;
