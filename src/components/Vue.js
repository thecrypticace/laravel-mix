let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let VueLoaderPlugin = require('vue-loader')
class Vue {
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
        loader: 'vue-loader',
      });

      this.vueLoaders().forEach((rule) => {
        webpackConfig.module.rules.push(rule);
      })

      webpackConfig.plugins.push(new VueLoaderPlugin());
      webpackConfig.plugins.push(this.extractPlugin());
    }

  /**
   * vue-loader-specific options.
   */
  vueLoaders() {

    let loaders = [];

    if (Config.extractVueStyles) {

      let sassLoader = {
        test : /\.sass$/,
        oneOf: [
          {
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'sass-loader?indentedSyntax',
            ],
          },
          {
            use : [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax',
            ]
          }
        ]
      };

      let scssLoader = {
        test: /\.scss$/,
        oneOf: [
          {
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'sass-loader',
            ],
          },
          {
            use : [
              'vue-style-loader',
              'css-loader',
              'sass-loader',
            ]
          }
        ]
      };

      if (Config.globalVueStyles) {

        scssLoader.use.push('sass-resources-loader')
        scssLoader.options = {
          resources: Mix.paths.root(Config.globalVueStyles)
        };

        sassLoader.use.push('sass-resources-loader')
        sassLoader.options = {
          resources: Mix.paths.root(Config.globalVueStyles)
        };
      }

      loaders.push(scssLoader);
      loaders.push(sassLoader);

      loaders.push({
        test: /\.css$/,
        oneOf: [
          {
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
            ],
          },
          {
            use : [
              'vue-style-loader',
              'css-loader',
            ]
          }
        ]
      });

      loaders.push({
        test: /\.stylus$/,
        oneOf: [
          {
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'stylus-loader'
            ],
          },
          {
            use : [
              'vue-style-loader',
              'css-loader',
              'stylus-loader'
            ]
          }
        ]
      });

      loaders.push({
        test: /\.less$/,
        oneOf: [
          {
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'less-loader'
            ],
          },
          {
            use : [
              'vue-style-loader',
              'css-loader',
              'less-loader'
            ]
          }
        ]
      });
    }

    return loaders;
  }

  extractPlugin() {
    if (typeof Config.extractVueStyles === 'string') {
      return new MiniCssExtractPlugin(this.extractFilePath());
    }

    let preprocessorName = Object.keys(Mix.components.all())
      .reverse()
      .find(componentName => {
        return ['sass', 'less', 'stylus', 'postCss'].includes(
          componentName
        );
      });

    if (!preprocessorName) {
      return new MiniCssExtractPlugin(this.extractFilePath());
    }

    return Mix.components.get(preprocessorName).extractPlugins.slice(-1)[0];
  }

  extractFilePath() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : 'vue-styles.css';

        return fileName.replace(Config.publicPath, '').replace(/^\//, '');
    }
}

module.exports = Vue;
