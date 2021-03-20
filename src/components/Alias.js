module.exports = class Alias {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * Add resolution aliases to webpack's config
     *
     * @param {Record<string,string>} paths
     */
    register(paths) {
        /** @type {Record<string, string>} */
        this.aliases = { ...(this.aliases || {}), ...paths };
    }

    webpackConfig(webpackConfig) {
        webpackConfig.resolve.alias = webpackConfig.resolve.alias || {};

        for (const [alias, path] of Object.entries(this.aliases)) {
            webpackConfig.resolve.alias[alias] = this.context.paths.root(path);
        }
    }
};
