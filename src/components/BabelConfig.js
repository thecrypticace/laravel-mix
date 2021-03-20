class BabelConfig {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     *
     * @param {import('@babel/core').TransformOptions} config
     */
    register(config) {
        this.context.config.babelConfig = config;
    }
}

module.exports = BabelConfig;
