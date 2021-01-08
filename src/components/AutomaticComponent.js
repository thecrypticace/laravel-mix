const Component = require('./Component');

class AutomaticComponent extends Component {
    /**
     * Create a new component instance.
     *
     * @param {import("../Mix")} mix
     */
    constructor(mix) {
        super(mix);

        this.passive = true;
    }
}

module.exports = AutomaticComponent;
