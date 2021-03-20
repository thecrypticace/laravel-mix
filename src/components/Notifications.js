let AutomaticComponent = require('./AutomaticComponent');

class Notifications extends AutomaticComponent {
    /**
     * webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        if (this.context.isUsing('notifications')) {
            let WebpackNotifierPlugin = require('webpack-notifier');

            return new WebpackNotifierPlugin({
                appID: 'Laravel Mix',

                title: 'Laravel Mix',
                alwaysNotify: this.context.config.notifications.onSuccess,
                timeout: false,
                hint: process.platform === 'linux' ? 'int:transient:1' : undefined,
                contentImage: this.context.paths.root(
                    'node_modules/laravel-mix/icons/laravel.png'
                )
            });
        }
    }
}

module.exports = Notifications;
