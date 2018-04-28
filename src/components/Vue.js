let webpackMerge = require('webpack-merge');
let { VueLoaderPlugin } = require('vue-loader');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

class Vue {

    constructor() {
        this.requiresCssExtraction = false;
    }

    /**
     * Required dependencies for the component.
     */
    dependencies() {
        if (Config.extractVueStyles && Config.globalVueStyles) {
            return ['sass-resources-loader']; // Required for importing global styles into every component.
        }
    }

    /**
     * Override the generated webpack configuration.
     *
     * @param {Object} webpackConfig
     */
    webpackConfig(webpackConfig) {
        webpackConfig.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader'
        });

        this.vueLoaders(webpackConfig);

        webpackConfig.plugins.push(new VueLoaderPlugin());

        if (Config.extractVueStyles) {
            this.requiresCssExtraction = true;
            const newConfig = webpackMerge.smart(webpackConfig, this.config());
            webpackConfig.optimization = newConfig.optimization;
        }
    }

    /**
     * vue-loader-specific options.
     */
    vueLoaders(webpackConfig) {
        let loaders = [];

        this._updateRuleLoaders(webpackConfig, 'css', [
            {
                use: [
                    Mix.components.get('css') || Config.extractVueStyles
                        ? MiniCssExtractPlugin.loader
                        : 'vue-style-loader',
                    'css-loader'
                ]
            }
        ]);

        this._updateRuleLoaders(webpackConfig, 'less', [
            {
                use: [
                    Mix.components.get('less') || Config.extractVueStyles
                        ? MiniCssExtractPlugin.loader
                        : 'vue-style-loader',
                    'css-loader',
                    'less-loader'
                ]
            }
        ]);

        let sassLoader = {
            loader: 'sass-loader'
        };

        if (Config.globalVueStyles) {
            sassLoader.options = {
                resources: Mix.paths.root(Config.globalVueStyles)
            };
        }

        this._updateRuleLoaders(webpackConfig, 's[ac]ss', [
            {
                use: [
                    Mix.components.get('sass') || Config.extractVueStyles
                        ? MiniCssExtractPlugin.loader
                        : 'vue-style-loader',
                    'css-loader',
                    sassLoader
                ]
            }
        ]);

        webpackConfig.module.rules.push({
            test: /\.stylus$/,
            oneOf: [
                {
                    use: [
                        Mix.components.get('stylus') || Config.extractVueStyles
                            ? MiniCssExtractPlugin.loader
                            : 'vue-style-loader',
                        'css-loader',
                        'stylus-loader'
                    ]
                }
            ]
        });

        return loaders;
    }

    /**
     * vue-loader-specific options.
     */
    _updateRuleLoaders(webpackConfig, loader, loaders) {
        let rule = webpackConfig.module.rules.find(
            rule => rule.test.toString() === `/\\.${loader}$/`
        );
        rule.oneOf = loaders;
        rule.oneOf.push({ use: rule.loaders });
        delete rule.loaders;
    }

    extractFilePath() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : '/css/vue-styles';

        return fileName.replace(Config.publicPath, '').replace(/^\//, '').replace('.css', '');
    }

    config() {
        return {
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        extractVueStyles: {
                            test: m => {
                                return /\.vue\?vue&type=style/.test(m.identifier());
                            },
                            name: this.extractFilePath(),
                            chunks: "all",
                            enforce: true,
                        },
                    },
                }
            }
        }
    }
}

module.exports = Vue;
