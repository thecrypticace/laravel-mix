class SourceMaps {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    register(
        generateForProduction = true,
        devType = 'eval-source-map',
        productionType = 'source-map'
    ) {
        let type = devType;

        if (this.context.inProduction()) {
            type = generateForProduction ? productionType : false;
        }

        this.context.config.sourcemaps = type;

        return this;
    }
}

module.exports = SourceMaps;
