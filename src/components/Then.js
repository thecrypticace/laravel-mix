class Then {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * The API name for the component.
     */
    name() {
        return ['then', 'after'];
    }

    register(callback) {
        this.context.listen('build', callback);

        return this;
    }
}

module.exports = Then;
