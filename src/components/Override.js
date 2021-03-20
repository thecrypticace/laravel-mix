class Override {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    register(callback) {
        this.context.listen('configReadyForUser', callback);
    }
}

module.exports = Override;
