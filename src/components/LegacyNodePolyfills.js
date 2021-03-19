const AutomaticComponent = require('./AutomaticComponent');
const webpack = require('webpack');

class LegacyNodePolyfills extends AutomaticComponent {
    webpackPlugins() {
        if (!Config.legacyNodePolyfills) {
            return [];
        }

        return [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser.js'
            })
        ];
    }

    webpackConfig() {
        if (!Config.legacyNodePolyfills) {
            return {};
        }

        return {
            resolve: {
                fallback: {
                    Buffer: 'buffer',
                    process: 'process/browser.js'
                }
            }
        };
    }
}

module.exports = LegacyNodePolyfills;
