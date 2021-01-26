let collect = require('collect.js');
let path = require('path');
let File = require('./File');

class Manifest {
    /**
     * Create a new Manifest instance.
     *
     * @param {string} name
     * @param {import("./Mix.js")} mix
     */
    constructor(name = 'mix-manifest.json', mix) {
        this.name = name;

        /** @type {Record<string, string>} */
        this.manifest = {};

        this.mix = mix;
        this.config = this.mix.config;
    }

    toJSON() {
        return this.manifest;
    }

    /**
     * Get the underlying manifest collection.
     *
     * @deprecated
     * @param {string|null} [file]
     */
    get(file = null) {
        if (file) {
            return path.posix.join(
                this.config.publicPath,
                this.manifest[this.normalizePath(file)]
            );
        }

        return collect(this.manifest).sortKeys().all();
    }

    /**
     * @internal
     * @param {{path: string, info: import("webpack").AssetInfo}} asset
     */
    addAsset(asset) {
        const path = this.normalizePath(asset.path);
        const original = path.replace(/\?id=\w{20}/, '');
        const hash = this.mix.versioning ? `?id=${asset.info.contenthash}` : '';

        this.manifest[original] = `${path}${hash}`;
    }

    /**
     * Add the given path to the manifest file.
     *
     * @deprecated
     * @param {string} filePath
     */
    add(filePath) {
        filePath = this.normalizePath(filePath);

        let original = filePath.replace(/\?id=\w{20}/, '');

        this.manifest[original] = filePath;

        return this;
    }

    /**
     * Add a new hashed key to the manifest.
     *
     * @deprecated
     * @param {string} file
     */
    hash(file) {
        let hash = new File(path.join(this.config.publicPath, file)).version();

        let filePath = this.normalizePath(file);

        this.manifest[filePath] = filePath + '?id=' + hash;

        return this;
    }

    /**
     * Transform the Webpack stats into the shape we need.
     *
     * @deprecated
     * @param {object} stats
     */
    transform(stats) {
        this.flattenAssets(stats).forEach(this.add.bind(this));

        return this;
    }

    /**
     * Refresh the mix-manifest.js file.
     * @deprecated
     */
    refresh() {
        File.find(this.path()).makeDirectories().write(this.manifest);
    }

    /**
     * Retrieve the JSON output from the manifest file.
     * @deprecated
     */
    read() {
        return JSON.parse(File.find(this.path()).read());
    }

    /**
     * Get the path to the manifest file.
     */
    path() {
        return path.join(this.config.publicPath, this.name);
    }

    /**
     * Flatten the generated stats assets into an array.
     *
     * @deprecated
     * @param {any} stats
     */
    flattenAssets(stats) {
        let assets = Object.assign({}, stats.assetsByChunkName);

        // If there's a temporary mix.js chunk, we can safely remove it.
        if (assets.mix) {
            assets.mix = collect(assets.mix).except('mix.js').all();
        }

        return (
            collect(assets)
                .flatten()
                // Don't add hot updates to manifest
                .filter(name => name.indexOf('hot-update') === -1)
                .all()
        );
    }

    /**
     * Prepare the provided path for processing.
     *
     * @param {string} filePath
     */
    normalizePath(filePath) {
        if (this.config.publicPath && filePath.startsWith(this.config.publicPath)) {
            filePath = filePath.substring(this.config.publicPath.length);
        }
        filePath = filePath.replace(/\\/g, '/');

        if (!filePath.startsWith('/')) {
            filePath = '/' + filePath;
        }

        return filePath;
    }
}

module.exports = Manifest;
