let MixDefinitionsPlugin = require('../webpackPlugins/MixDefinitionsPlugin');
let BuildCallbackPlugin = require('../webpackPlugins/BuildCallbackPlugin');
let CustomTasksPlugin = require('../webpackPlugins/CustomTasksPlugin');
let ManifestPlugin = require('../webpackPlugins/ManifestPlugin');
let MockEntryPlugin = require('../webpackPlugins/MockEntryPlugin');
let BuildOutputPlugin = require('../webpackPlugins/BuildOutputPlugin');
const { getGlobalMix } = require('../MixGlobal');

/**
 *
 * @param {import("../Mix")} mix
 */
module.exports = function (mix) {
    // TODO: Remove in Mix 7 -- Here for backwards compat if a plugin requires this file
    mix = mix || getGlobalMix();

    let plugins = [];

    // If the user didn't declare any JS compilation, we still need to
    // use a temporary script to force a compile. This plugin will
    // handle the process of deleting the compiled script.
    if (!mix.bundlingJavaScript) {
        plugins.push(new MockEntryPlugin());
    }

    // Activate support for Mix_ .env definitions.
    plugins.push(
        MixDefinitionsPlugin.build({
            NODE_ENV: mix.inProduction()
                ? 'production'
                : process.env.NODE_ENV || 'development'
        })
    );

    // Handle the creation of the mix-manifest.json file.
    plugins.push(new ManifestPlugin(mix));

    // Handle all custom, non-webpack tasks.
    plugins.push(new CustomTasksPlugin());

    // Notify the rest of our app when Webpack has finished its build.
    plugins.push(new BuildCallbackPlugin(stats => mix.dispatch('build', stats)));

    // Enable custom output when the Webpack build completes.
    plugins.push(
        new BuildOutputPlugin({
            clearConsole: mix.config.clearConsole,
            showRelated: true
        })
    );

    return plugins;
};
