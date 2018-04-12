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
    webpackConfig(config) {

      config.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader',
      });

      this.vueLoaders().forEach((rule) => {
        config.module.rules.push(rule);
      })

      config.plugins.push(this.extractPlugin());
    }

  /**
   * vue-loader-specific options.
   */
  vueLoaders() {

    let loaders = [];

    if (Config.extractVueStyles) {

      let sassLoader = {
        test : /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?indentedSyntax',
        ],
      };

      let scssLoader = {
        test : /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      };

      if (Config.globalVueStyles) {

        sassLoader.use.push('sass-resources-loader')
        scssLoader.options = {
          resources: Mix.paths.root(Config.globalVueStyles)
        };

        sassLoader.use.push('sass-resources-loader')
        sassLoader.options = {
          resources: Mix.paths.root(Config.globalVueStyles)
        };
      }

      loaders.push({
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      });

      loaders.push({
        test: /\.stylus$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ],
      });

      loaders.push({
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ],
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
