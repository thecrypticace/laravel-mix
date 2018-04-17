let Assert = require('../Assert');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

class Preprocessor {
    /**
     * Assets to append to the webpack entry.
     *
     * @param {Entry} entry
     */
    webpackEntry(entry) {
        this.details.forEach(detail => {
            if (detail.type === 'fastsass') return;

            entry.add(entry.keys()[0], detail.src.path());
        });
    }

    /**
     * webpack rules to be appended to the master config.
     */
    webpackRules() {
        let rules = [];

        this.details.forEach(preprocessor => {
            if (preprocessor.type === 'fastsass') return;

            tap(new MiniCssExtractPlugin({
              filename: `${preprocessor.output.segments.path}`, // TODO - issue with mini extract plugin : https://github.com/webpack-contrib/mini-css-extract-plugin/issues/37#issuecomment-382072952
            }), extractPlugin => {
                let loaders = [
                    {
                      loader : 'vue-style-loader', // TODO - this needs to be dynamically put here
                    },
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: Config.processCssUrls,
                            sourceMap: Mix.isUsing('sourcemaps'),
                            importLoaders: 1
                        }
                    },

                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap:
                                preprocessor.type === 'sass' &&
                                Config.processCssUrls
                                    ? true
                                    : Mix.isUsing('sourcemaps'),
                            ident: 'postcss',
                            plugins: (function() {
                                let plugins = Config.postCss;

                                if (
                                    preprocessor.postCssPlugins &&
                                    preprocessor.postCssPlugins.length
                                ) {
                                    plugins = preprocessor.postCssPlugins;
                                }

                                if (
                                    Config.autoprefixer &&
                                    Config.autoprefixer.enabled
                                ) {
                                    plugins.push(
                                        require('autoprefixer')(
                                            Config.autoprefixer.options
                                        )
                                    );
                                }

                                return plugins;
                            })()
                        }
                    }
                ];

                if (preprocessor.type === 'sass' && Config.processCssUrls) {
                    loaders.push({
                        loader: 'resolve-url-loader',
                        options: {
                            sourceMap: true,
                            root: Mix.paths.root('node_modules')
                        }
                    });
                }

                if (preprocessor.type !== 'postCss') {
                    loaders.push({
                        loader: `${preprocessor.type}-loader`,
                        options: Object.assign(preprocessor.pluginOptions, {
                            sourceMap:
                                preprocessor.type === 'sass' &&
                                Config.processCssUrls
                                    ? true
                                    : Mix.isUsing('sourcemaps')
                        })
                    });
                }

                rules.push({
                    test: preprocessor.src.path(),
                    use: loaders
                });

                this.extractPlugins = (this.extractPlugins || []).concat(
                    extractPlugin
                );
            });
        });

        return rules;
    }

    /**
     * webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        return this.extractPlugins;
    }

    /**
     * Register a generic CSS preprocessor.
     *
     * @param {string} type
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     */
    preprocess(type, src, output, pluginOptions = {}) {
        Assert.preprocessor(type, src, output);

        src = new File(src);

        output = this.normalizeOutput(
            new File(output),
            src.nameWithoutExtension() + '.css'
        );

        this.details = (this.details || []).concat({
            type: this.constructor.name.toLowerCase(),
            src,
            output,
            pluginOptions
        });

        if (type === 'fastSass') {
            Mix.addAsset(output);
        }

        return this;
    }

    /**
     * Generate a full output path, using a fallback
     * file name, if a directory is provided.
     *
     * @param {Object} output
     * @param {Object} fallbackName
     */
    normalizeOutput(output, fallbackName) {
        if (output.isDirectory()) {
            output = new File(path.join(output.filePath, fallbackName));
        }

        return output;
    }
}

module.exports = Preprocessor;
