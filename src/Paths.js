let argv = require('yargs').argv;
let path = require('path');

class Paths {
    /**
     * Create a new Paths instance.
     */
    constructor() {
        // TODO: Refactor setup to allow removing this check
        if (process.env.NODE_ENV === 'test') {
            this.rootPath = path.resolve(__dirname, '../');
        } else {
            this.rootPath = process.cwd();
        }
    }

    /**
     * Set the root path to resolve webpack.mix.js.
     *
     * @param {string} path
     */
    setRootPath(path) {
        this.rootPath = path;

        return this;
    }

    /**
     * Determine the path to the user's webpack.mix.js file.
     */
    mix() {
        this._mixFilePath = this._mixFilePath || this.findMixFile();

        return this._mixFilePath;
    }

    /**
     * Determine the path to the user's webpack.mix.js file.
     *
     * @internal
     */
    findMixFile() {
        const path = this.root(
            process.env && process.env.MIX_FILE ? process.env.MIX_FILE : 'webpack.mix'
        );

        /**
         *
         * @param {string} path
         * @returns {string|null}
         */
        const find = path => {
            try {
                require.resolve(path);

                return path;
            } catch (err) {
                return null;
            }
        };

        return find(`${path}.mjs`) || find(`${path}.cjs`) || find(`${path}.js`) || path;
    }

    /**
     * Determine the project root.
     *
     * @param {string|null} append
     */
    root(append = '') {
        return path.resolve(this.rootPath, append);
    }
}

module.exports = Paths;
