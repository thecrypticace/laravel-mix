class When {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     *
     * @param {boolean} condition
     * @param {(mix: import('../Mix')['api']) => any} callback
     */
    register(condition, callback) {
        if (condition) {
            callback(this.context.api);
        }
    }
}

module.exports = When;
