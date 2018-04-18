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

      // TODO - get extraction to work
      webpackConfig.plugins.push(this.extractPlugin());
    }

    /**
     * vue-loader-specific options.
     */
    vueLoaders(webpackConfig) {

      // TODO - get extraction to work
      // if (Config.extractVueStyles) {

      let loaders = [];

      this._updateRuleLoaders(webpackConfig, 'css', [
        // {
        //   use: [
        //     MiniCssExtractPlugin.loader,
        //     'css-loader',
        //   ],
        // },
        {
          use : [
            'vue-style-loader',
            'css-loader',
          ]
        },
      ])

      this._updateRuleLoaders(webpackConfig, 'less', [
        // {
        //   use: [
        //     MiniCssExtractPlugin.loader,
        //     'css-loader',
        //     'less-loader'
        //   ],
        // },
        {
          use : [
            'vue-style-loader',
            'css-loader',
            'less-loader'
          ]
        }
      ]);

      this._updateRuleLoaders(webpackConfig, 's[ac]ss', [
       // {
       //   use: [
       //     MiniCssExtractPlugin.loader,
       //     'css-loader',
       //     'sass-loader?indentedSyntax',
       //   ],
       // },
       {
         use : [
           'vue-style-loader',
           'css-loader',
           'sass-loader?indentedSyntax',
         ]
       }
      ])

      webpackConfig.module.rules.push({
        test: /\.stylus$/,
        oneOf: [
          // {
          //   use: [
          //     MiniCssExtractPlugin.loader,
          //     'css-loader',
          //     'stylus-loader'
          //   ],
          // },
          {
            use : [
              'vue-style-loader',
              'css-loader',
              'stylus-loader'
            ]
          }
        ]
      });

      // TODO - this needs to be revisited
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

      return loaders;
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

    extractPlugin() {
      if (typeof Config.extractVueStyles === 'string') {
        return new MiniCssExtractPlugin(this.extractFileName());
      }

      let preprocessorName = Object.keys(Mix.components.all())
        .reverse()
        .find(componentName => {
          return ['sass', 'less', 'stylus', 'postCss'].includes(
            componentName
          );
        });

      if (!preprocessorName) {
        return new MiniCssExtractPlugin(this.extractFileName());
      }

      return Mix.components.get(preprocessorName).extractPlugins.slice(-1)[0];
    }

    extractFileName() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : 'vue-styles.css';

        return `/css/${fileName.replace(Config.publicPath, '').replace(/^\//, '')}`;
    }
}

module.exports = Vue;
