const webpack = require('webpack');
const Compilation = webpack.Compilation;
const RawSource = webpack.sources.RawSource;

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
            // Trick the real content hash plugin into computing a hash for every asset
            // The template plugin kickstarts the hashing process but this requires
            // [contenthash] to be present in the output filename of the asset
            // So instead we provide a fake hash before optimization which
            // causes the plugin to calculate a real hash based on the
            // content of an asset instead of generation entirely
            compilation.hooks.processAssets.tap(
                {
                    name: 'ManifestPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH
                },

                () => {
                    if (!this.mix.versioning) {
                        return;
                    }

                    compilation.assetsInfo.forEach(info => {
                        info.contenthash =
                            info.contenthash || 'a_fake_hash_to_cause_generation';
                    });
                }
            );

            // Record generated assets into the manifest
            compilation.hooks.processAssets.tap(
                {
                    name: 'ManifestPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE
                },

                assets => this.recordAssets(compilation, assets)
            );

            // Write the manifest
            compilation.hooks.processAssets.tapPromise(
                {
                    name: 'ManifestPlugin',
                    stage: Compilation.PROCESS_ASSETS_STAGE_REPORT
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
    async writeManifest(compilation) {
        // TODO: Add Config option
        // TODO: Merge manifest from multiple builds?
        // TODO: Find a way to still be compatible with laravel-mix-merge-manifest — it will not be needed anymore but we shouldn't break it
        const current = await this.manifest.current();
        const manifest = current.mergedWith([this.manifest]);

        const source = new RawSource(JSON.stringify(manifest, null, 4));

        compilation.assets[manifest.name] = source;
    }
}

module.exports = ManifestPlugin;
