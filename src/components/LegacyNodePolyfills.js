const AutomaticComponent = require('./AutomaticComponent');
const webpack = require('webpack');

class LegacyNodePolyfills extends AutomaticComponent {
    webpackPlugins() {
        if (!this.context.config.legacyNodePolyfills) {
            return [];
        }

        return [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser'
            })
        ];
    }

    webpackConfig() {
        if (!this.context.config.legacyNodePolyfills) {
            return {};
        }

        return {
            resolve: {
                fallback: {
                    Buffer: 'buffer',
                    process: 'process/browser'
                }
            }
        };
    }
}

module.exports = LegacyNodePolyfills;
