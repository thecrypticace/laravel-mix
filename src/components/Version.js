let glob = require('glob');
let path = require('path');
let File = require('../File');
let VersionFilesTask = require('../tasks/VersionFilesTask');

class Version {
    constructor() {
        /** @type {import("../Mix.js")} */
        this.context = global.Mix;
    }

    /**
     * Register the component.
     *
     * @param {string|string[]} files
     */
    register(files = []) {
        if (!Array.isArray(files)) {
            files = [files];
        }

        files = files.flatMap(filePath => this.getAllRecursively(filePath));

        this.context.addTask(new VersionFilesTask({ files }));
    }

    /**
     *
     * @param {string} filePath
     * @returns {string[]}
     */
    getAllRecursively(filePath) {
        if (File.find(filePath).isDirectory()) {
            filePath += path.sep + '**/*';
        }

        if (!filePath.includes('*')) {
            return [filePath];
        }

        return glob.sync(new File(filePath).forceFromPublic().relativePath(), {
            nodir: true
        });
    }
}

module.exports = Version;
