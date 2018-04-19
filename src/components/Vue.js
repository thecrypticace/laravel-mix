let { VueLoaderPlugin } = require('vue-loader')
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

      this.vueLoaders(webpackConfig)

      webpackConfig.plugins.push(new VueLoaderPlugin());

      if (Config.extractVueStyles) {
        webpackConfig.plugins.push(
          this.extractPlugin()
        );
      }
    }

    /**
     * vue-loader-specific options.
     */
    vueLoaders(webpackConfig) {

      let loaders = [];

      this._updateRuleLoaders(webpackConfig, 'css', [
        {
          use : [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ]
        },
      ])

      this._updateRuleLoaders(webpackConfig, 'less', [
        {
          use : [
            Mix.components.get('less') || Config.extractVueStyles ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            'css-loader',
            'less-loader'
          ]
        }
      ]);

      this._updateRuleLoaders(webpackConfig, 's[ac]ss', [
       {
         use : [
           Mix.components.get('sass') || Config.extractVueStyles ? MiniCssExtractPlugin.loader : 'vue-style-loader',
           'css-loader',
           'sass-loader',
         ]
       }
      ]);

      // TODO - Global Styles for Sass only?
      // if (Config.globalVueStyles) {
      //   scssLoader.use.push('sass-resources-loader')
      //   scssLoader.options = {
      //     resources: Mix.paths.root(Config.globalVueStyles)
      //   };
      //
      //   sassLoader.use.push('sass-resources-loader')
      //   sassLoader.options = {
      //     resources: Mix.paths.root(Config.globalVueStyles)
      //   };
      // }

      webpackConfig.module.rules.push({
        test: /\.stylus$/,
        oneOf: [
          {
            use : [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'stylus-loader'
            ]
          }
        ]
      });

      return loaders;
    }

    extractPlugin() {
      if (typeof Config.extractVueStyles === 'string') {
        return new MiniCssExtractPlugin({
          filename: this.extractFileName(),
          chunkFilename: this.extractFileName(),
        });
      }

      let preprocessorName = Object.keys(Mix.components.all())
        .reverse()
        .find(componentName => {
        return ['sass', 'less', 'stylus', 'postCss'].includes(
          componentName
        );
      });

      if (!preprocessorName) {
        return new MiniCssExtractPlugin({
          filename: this.extractFileName(),
          chunkFilename: this.extractFileName(),
        })
      }

      return  Mix.components.get(preprocessorName).extractPlugins.slice(1)[0];
    }

    /**
     * vue-loader-specific options.
     */
    _updateRuleLoaders(webpackConfig, loader, loaders) {
      let rule = webpackConfig.module.rules.find(rule => rule.test.toString() === `/\\.${loader}$/`)
      rule.oneOf = loaders;
      rule.oneOf.push({ use : rule.loaders})
      delete rule.loaders;
    }

    extractFileName() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : '/css/vue-styles.css';

        return `${fileName.replace(Config.publicPath, '').replace(/^\//, '')}`;
    }
}

module.exports = Vue;
