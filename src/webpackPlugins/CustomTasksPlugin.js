let Log = require('../Log');
let collect = require('collect.js');
const webpack = require('webpack');

class CustomTasksPlugin {
    /**
     * @param {import("../Mix.js")} mix
     */
    constructor(mix) {
        this.mix = mix;
    }

    /**
     * Apply the plugin.
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.done.tapPromise(this.constructor.name, async stats => {
            await this.runTasks(stats);

            if (this.mix.inProduction()) {
                await this.minifyAssets();
            }

            if (this.mix.isWatching()) {
                this.mix.tasks.forEach(task => task.watch(this.mix.isPolling()));
            }
        });
    }

    /**
     * Execute the task.
     *
     * @param {import("../tasks/Task")} task
     * @param {import("webpack").Stats} stats
     */
    async runTask(task, stats) {
        await Promise.resolve(task.run());

        await Promise.allSettled(task.assets.map(asset => this.addAsset(asset, stats)));
    }

    /**
     * Add asset to the webpack statss
     *
     * @param {import("../File")} asset
     * @param {import("webpack").Stats} stats
     */
    async addAsset(asset, stats) {
        // Skip adding directories to the manifest
        // TODO: We should probably add the directory but skip hashing
        if (asset.isDirectory()) {
            return;
        }

        const path = asset.pathFromPublic();

        // Add the asset to the manifest
        this.mix.manifest.add(path);

        // Update the Webpack assets list for better terminal output.
        stats.compilation.assets[path] = new webpack.sources.SizeOnlySource(asset.size());
    }

    /**
     * Execute potentially asynchronous tasks sequentially.
     *
     * @param {import("webpack").Stats} stats
     */
    async runTasks(stats) {
        for (const task of this.mix.tasks) {
            await this.runTask(task, stats);
        }
    }

    /**
     * Minify the given asset file.
     */
    async minifyAssets() {
        const assets = this.mix.tasks
            .filter(task => task.constructor.name !== 'VersionFilesTask')
            .flatMap(task => task.assets);

        const tasks = assets.map(async asset => {
            try {
                await asset.minify();
            } catch (e) {
                Log.error(
                    `Whoops! We had trouble minifying "${asset.relativePath()}". ` +
                        `Perhaps you need to use mix.babel() instead?`
                );

                throw e;
            }
        });

        await Promise.allSettled(tasks);
    }
}

module.exports = CustomTasksPlugin;
