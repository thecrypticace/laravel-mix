const argv = require('yargs').argv;

/** @typedef {import('../types/config').MixConfig} MixConfig */

/**
 * @param {import("./Mix")} mix
 * @returns {MixConfig}
 **/
module.exports = function (mix) {
    return {
        /**
         * Determine if webpack should be triggered in a production environment.
         *
         * @type {Boolean}
         */
        production: process.env.NODE_ENV === 'production' || process.argv.includes('-p'),

        /**
         * Determine if we should enable hot reloading.
         *
         * @type {Boolean}
         */
        hmr: process.argv.includes('--hot'),

        /**
         * Hostname and port used for the hot reload module
         *
         * @type {{host: string, port: string}}
         */
        hmrOptions: {
            host: 'localhost',
            port: !!argv.hmrPort ? argv.hmrPort : '8080'
        },

        /**
         * PostCSS plugins to be applied to compiled CSS.
         *
         * See: https://github.com/postcss/postcss/blob/master/docs/plugins.md
         *
         * @type {import('postcss').AcceptedPlugin[]}
         */
        postCss: [],

        /**
         * Determine if we should enable autoprefixer by default.
         * May be set to false to disable it.
         *
         * @type {false|import('autoprefixer').Options}
         */
        autoprefixer: {},

        /**
         * The public path for the build.
         *
         * @type {String}
         */
        publicPath: '',

        /**
         * The path for the runtime chunk (`manifest.js`).
         *
         * Defaults to being placed next to compiled JS files.
         *
         * @type {String|null}
         */
        runtimeChunkPath: null,

        /**
         * Determine if error notifications should be displayed for each build.
         *
         * @type {{onSuccess?:boolean, onFailure?:boolean}}
         */
        notifications: {
            onSuccess: true,
            onFailure: true
        },

        /**
         * Determine if sourcemaps should be created for the build.
         *
         * @type {false | string}
         */
        sourcemaps: false,

        /**
         * The resource root for the build.
         *
         * @type {String}
         */
        resourceRoot: '/',

        /**
         * Image Loader defaults.
         * See: https://github.com/thetalecrafter/img-loader#options
         *
         * @type {Object}
         */
        imgLoaderOptions: {
            enabled: true,
            gifsicle: {},
            mozjpeg: {},
            optipng: {},
            svgo: {}
        },

        /**
         * File Loader directory defaults.
         *
         * @type {Object}
         */
        fileLoaderDirs: {
            images: 'images',
            fonts: 'fonts'
        },

        /**
         * The default Babel configuration.
         *
         * @param {string} babelRcPath
         */
        babel: function (babelRcPath) {
            babelRcPath = babelRcPath || mix.paths.root('.babelrc');

            return require('./BabelConfig').generate(this.babelConfig, babelRcPath);
        },

        /**
         * Determine if CSS relative url()s should be resolved by webpack.
         * Disabling this can improve performance greatly.
         *
         * @type {Boolean}
         */
        processCssUrls: true,

        /**
         * Terser-specific settings for Webpack.
         *
         * See: https://github.com/webpack-contrib/terser-webpack-plugin#options
         *
         * @type {Object}
         */
        terser: {
            parallel: true,
            terserOptions: {
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                }
            }
        },

        /**
         * cssnano-specific settings for Webpack.
         * Disabled if set to false.
         *
         * See: https://cssnano.co/optimisations/
         *
         * @type {false|import('cssnano').CssNanoOptions}
         */
        cssNano: {},

        /**
         * CleanCss-specific settings for Webpack.
         *
         * See: https://github.com/jakubpawlowicz/clean-css#constructor-options
         *
         * @type {Object}
         */
        cleanCss: {},

        /**
         * Custom Babel configuration to be merged with Mix's defaults.
         *
         * @type {Object}
         */
        babelConfig: {},

        /**
         * Determine if Mix should ask the friendly errors plugin to
         * clear the console before outputting the results or not.
         *
         * https://github.com/geowarin/friendly-errors-webpack-plugin#options
         *
         * @type {Boolean}
         */
        clearConsole: true,

        /**
         * Enable legacy node -> browser polyfills for things like `process` and `Buffer`.
         *
         * @type {Boolean}
         */
        legacyNodePolyfills: true,

        /**
         * Options to pass to vue-loader
         *
         * @deprecated Use `.vue({options: {…}})` instead
         *
         * @type {object}
         */
        vue: {},

        /**
         * Merge the given options with the current defaults.
         *
         * @param {Partial<MixConfig>} options
         */
        merge(options) {
            Object.keys(options).forEach((key) => {
                // @ts-ignore
                this[key] = options[key];
            });
        }
    };
};
