let File = require('../File');
let CopyFilesTask = require('../tasks/CopyFilesTask');

class Copy {
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
        return ['copy', 'copyDirectory'];
    }

    /**
     * Register the component.
     *
     * @param {*} from
     * @param {string} to
     */
    register(from, to) {
        this.context.addTask(new CopyFilesTask({ from, to: new File(to) }));
    }
}

module.exports = Copy;
