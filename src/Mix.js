let buildConfig = require('./config');
let { Chunks } = require('./Chunks');
let ComponentRegistrar = require('./components/ComponentRegistrar');
let Components = require('./components/Components');
let Dispatcher = require('./Dispatcher');
let Dotenv = require('dotenv');
let File = require('./File');
let Manifest = require('./Manifest');
let Paths = require('./Paths');
let WebpackConfig = require('./builder/WebpackConfig');
let HotReloading = require('./HotReloading');
let Dependencies = require('./Dependencies');

/** @typedef {import("./tasks/Task")} Task */
/** @typedef {import('../types/component').Dependency} Dependency */

class Mix {
    /** @type {Mix[]} */
    static all = [];

    /** @type {Mix[]} */
    static current = [];

    /**
     * Create a new instance.
     *
     * @param {Mix|null} parent
     */
    constructor(parent = null) {
        /** @type {ReturnType<buildConfig>} */
        this.config = parent ? parent.config : buildConfig();

        this.chunks = new Chunks(this);
        this.components = new Components();
        this.dispatcher = new Dispatcher();
        this.manifest = new Manifest();
        this.paths = new Paths();
        this.registrar = new ComponentRegistrar(this);
        this.webpackConfig = new WebpackConfig(this);

        /** @type {Task[]} */
        this.tasks = [];

        /** @type {Dependency[]} */
        this.dependencies = [];

        this.bundlingJavaScript = false;

        /**
         * @internal
         * @type {string|null}
         */
        this.globalStyles = null;

        /**
         * @internal
         * @type {boolean|string}
         **/
        this.extractingStyles = false;
    }

    boot() {
        // Load .env
        Dotenv.config();

        // If we're using Laravel set the public path by default
        if (this.sees('laravel')) {
            this.config.publicPath = 'public';
        }

        this.listen('init', () => new HotReloading(this.config).record());
        this.listen('internal:install-dependencies', () => Dependencies.installQueued());
    }

    get api() {
        this._api = this._api || new Api(this.registrar.installAll());

        return this._api;
    }

    /**
     * Determine if the given config item is truthy.
     *
     * @param {string} tool
     */
    isUsing(tool) {
        return !!this.config[tool];
    }

    /**
     * Determine if Mix is executing in a production environment.
     */
    inProduction() {
        return this.config.production;
    }

    /**
     * Determine if Mix should watch files for changes.
     */
    isWatching() {
        return process.argv.includes('--watch') || process.argv.includes('--hot');
    }

    /**
     * Determine if polling is used for file watching
     */
    isPolling() {
        return this.isWatching() && process.argv.includes('--watch-poll');
    }

    /**
     * Determine if Mix sees a particular tool or framework.
     *
     * @param {string} tool
     */
    sees(tool) {
        if (tool === 'laravel') {
            return File.exists('./artisan');
        }

        return false;
    }

    /**
     * Determine if the given npm package is installed.
     *
     * @param {string} npmPackage
     */
    seesNpmPackage(npmPackage) {
        try {
            require.resolve(npmPackage);

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Queue up a new task.
     *
     * @param {Task} task
     */
    addTask(task) {
        this.tasks.push(task);
    }

    /**
     * Listen for the given event.
     *
     * @param {string}   event
     * @param {Function} callback
     */
    listen(event, callback) {
        this.dispatcher.listen(event, callback);
    }

    /**
     * Dispatch the given event.
     *
     * @param {string} event
     * @param {*}      data
     */
    async dispatch(event, data) {
        if (typeof data === 'function') {
            data = data();
        }

        return this.dispatcher.fire(event, data);
    }

    /** @internal */
    pushCurrent() {
        Mix.current.push(this.makeCurrent());
    }

    /** @internal */
    popCurrent() {
        Mix.current.pop();

        const context = Mix.current[Mix.current.length - 1];
        context && context.makeCurrent();
    }

    /**
     * @internal
     * @template T
     * @param {(mix: Mix) => T} callback
     */
    withChild(callback) {
        return new Mix(this).whileCurrent(callback);
    }

    /**
     * @internal
     * @template T
     * @param {(mix: Mix) => T} callback
     */
    whileCurrent(callback) {
        this.pushCurrent();
        const result = callback(this);
        this.popCurrent();

        return result;
    }

    /**
     * @internal
     */
    makeCurrent() {
        // Set up some globals from current context
        // The goal would to be eventually remove these

        global.Config = this.config;
        global.Mix = this;
        global.webpackConfig = this.webpackConfig;

        this.chunks.makeCurrent();

        return this;
    }
}

module.exports = Mix;
