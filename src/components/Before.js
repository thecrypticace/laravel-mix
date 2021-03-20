class Before {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * Register the component.
     *
     * @param  {Function} callback
     * @return {void}
     */
    register(callback) {
        this.context.listen('init', callback);
    }
}

module.exports = Before;
