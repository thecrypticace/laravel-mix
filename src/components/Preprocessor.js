let Assert = require('../Assert');
let path = require('path');
let File = require('../File');
let { Chunks } = require('../Chunks');
let CssWebpackConfig = require('./CssWebpackConfig');
let PostCssPluginsFactory = require('../PostCssPluginsFactory');

/** @typedef {import("../builder/Entry.js")} Entry */

/**
 * @typedef {object} Detail
 * @property {string} type
 * @property {File} src
 * @property {File} output
 * @property {any} pluginOptions
 * @property {import('postcss').AcceptedPlugin[]} postCssPlugins
 * @property {boolean} [processUrls]
 */

class Preprocessor {
    /**
     * Create a new component instance.
     */
    constructor() {
        /** @type {Detail[]} */
        this.details = [];
    }

    /** @returns {import("../Mix.js")} */
    get _mix() {
        // @ts-ignore
        return Mix;
    }

    get chunks() {
        return this._mix.chunks;
    }

    /**
     * Assets to append to the webpack entry.
     *
     * @param {Entry} entry
     */
    webpackEntry(entry) {
        this.details.forEach(detail => {
            entry.add(entry.keys()[0], detail.src.path());
        });
    }

    /**
     * webpack rules to be appended to the master config.
     */
    webpackRules() {
        return this.details.map(preprocessor => ({
            test: preprocessor.src.path(),
            use: this.webpackLoaders(preprocessor)
        }));
    }

    /**
     * Fetch all necessary webpack loaders.
     *
     * @param {Detail} preprocessor
     */
    webpackLoaders(preprocessor) {
        let processUrls = this.shouldProcessUrls(preprocessor);

        /** @type {{loader: string, options?: any}[]} */
        let loaders = [
            ...CssWebpackConfig.afterLoaders({ method: 'extract' }),
            {
                loader: 'css-loader',
                options: {
                    // @ts-ignore
                    url: (url, resourcePath) => {
                        if (url.startsWith('/')) {
                            return false;
                        }

                        return processUrls;
                    },
                    sourceMap: this._mix.isUsing('sourcemaps'),
                    importLoaders: 1
                }
            },
            {
                loader: 'postcss-loader',
                options: this.postCssLoaderOptions(preprocessor)
            }
        ];

        if (preprocessor.type === 'sass' && processUrls) {
            loaders.push({
                loader: 'resolve-url-loader',
                options: {
                    sourceMap: true
                }
            });
        }

        if (preprocessor.type !== 'postCss') {
            loaders.push({
                loader: `${preprocessor.type}-loader`,
                options: this.loaderOptions(preprocessor, processUrls)
            });
        }

        loaders.push(
            ...CssWebpackConfig.beforeLoaders({
                type: preprocessor.type,
                injectGlobalStyles: false
            })
        );

        return loaders;
    }

    /**
     * Prepare the preprocessor plugin options.
     *
     * @param {Detail} preprocessor
     * @param {Boolean} processUrls
     */
    loaderOptions(preprocessor, processUrls) {
        return Object.assign(preprocessor.pluginOptions, {
            sourceMap:
                preprocessor.type === 'sass' && processUrls
                    ? true
                    : this._mix.isUsing('sourcemaps')
        });
    }

    /**
     * Generate the options object for the PostCSS Loader.
     *
     * @param {Detail} preprocessor
     */
    postCssLoaderOptions(preprocessor) {
        return {
            sourceMap: this._mix.isUsing('sourcemaps'),
            postcssOptions: {
                plugins: new PostCssPluginsFactory(preprocessor, this._mix.config).load(),
                hideNothingWarning: true
            }
        };
    }

    /**
     * Register a generic CSS preprocessor.
     *
     * @param {string} type
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     * @param {import('postcss').AcceptedPlugin[]} postCssPlugins
     */
    preprocess(type, src, output, pluginOptions = {}, postCssPlugins = []) {
        Assert.preprocessor(type, src, output);

        const srcFile = new File(src);
        const outputFile = this.normalizeOutput(
            new File(output),
            srcFile.nameWithoutExtension() + '.css'
        );

        this.details.push({
            type: this.constructor.name.toLowerCase(),
            src: srcFile,
            output: outputFile,
            pluginOptions,
            postCssPlugins
        });

        this._addChunks(
            `styles-${outputFile.relativePathWithoutExtension()}`,
            srcFile,
            outputFile
        );

        return this;
    }

    /**
     * Determine whether to apply url preprocessing.
     *
     * @param {Detail} preprocessor
     */
    shouldProcessUrls(preprocessor) {
        const processUrls =
            preprocessor.pluginOptions.processUrls !== undefined
                ? preprocessor.pluginOptions.processUrls
                : this._mix.config.processCssUrls;

        delete preprocessor.pluginOptions.processUrls;

        return processUrls;
    }

    /**
     * Generate a full output path, using a fallback
     * file name, if a directory is provided.
     *
     * @param {File} output
     * @param {string} fallbackName
     */
    normalizeOutput(output, fallbackName) {
        if (output.isDirectory()) {
            output = new File(path.join(output.filePath, fallbackName));
        }

        return output;
    }

    chunkRegex() {
        return /\.p?css$/;
    }

    /**
     * Add the necessary chunks for this preprocessor
     *
     * This method is for internal use only for now.
     *
     * @internal
     *
     * @param {string} name
     * @param {File} src
     * @param {File} output
     */
    _addChunks(name, src, output) {
        const tests = [
            // 1. Ensure the file is a CSS file
            this.chunkRegex(),

            // 2. Ensure that just this file is included in this chunk
            // _or any dependencies_
            src.path()
        ];

        const attrs = {
            chunks: 'all',
            enforce: true,
            type: 'css/mini-extract'
        };

        this.chunks.add(name, output.normalizedOutputPath(), tests, attrs);
    }
}

module.exports = Preprocessor;
