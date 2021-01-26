const webpack = require('webpack');

class ManifestPlugin {
    /**
     *
     * @param {import("../Mix.js")} mix
     */
    constructor(mix) {
        this.mix = mix;
        this.manifest = this.mix.manifest;
    }

    /**
     * Apply the plugin.
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.compilation.tap('ManifestPlugin', compilation => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'ManifestPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
                    additionalAssets: true
                },

                assets => this.recordAssets(compilation, assets)
            );

            compilation.hooks.processAssets.tap(
                {
                    name: 'ManifestPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
                    additionalAssets: true
                },

                () => this.writeManifest(compilation)
            );
        });
    }

    /**
     *
     * @param {import("webpack").Compilation} compilation
     * @param {Record<string, import("webpack").sources.Source>} assets
     */
    recordAssets(compilation, assets) {
        for (const path of Object.keys(assets)) {
            const info = compilation.assetsInfo.get(path);
            if (!info) {
                continue;
            }

            this.manifest.addAsset({ path, info });
        }
    }

    /**
     *
     * @param {webpack.Compilation} compilation
     */
    writeManifest(compilation) {
        // TODO: Add Config option
        // TODO: Merge manifest from multiple builds?
        // TODO: Find a way to still be compatible with laravel-mix-merge-manifest — it will not be needed anymore but we shouldn't break it
        const current = this.manifest.current();
        const manifest = current.mergedWith([this.manifest]);

        const source = new webpack.sources.RawSource(JSON.stringify(manifest, null, 4));

        compilation.assets[manifest.name] = source;
    }
}

module.exports = ManifestPlugin;
