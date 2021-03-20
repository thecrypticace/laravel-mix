class AutomaticComponent {
    /**
     * Create a new component instance.
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
        this.passive = true;
    }
}

module.exports = AutomaticComponent;
