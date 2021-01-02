let path = require('path');

/** @typedef {any} CacheGroup */
/** @typedef {any} CacheGroupsContext */

/**
 * @typedef {(module: import("webpack").Module, chunks: import("webpack").Chunk[]) => boolean} ChunkTestCallback
 * @typedef {undefined|boolean|string|RegExp|ChunkTestCallback} ChunkTest
 */

/**
 * @typedef {(chunk: CacheGroup, id: string) => boolean} ChunkFindCallback
 */

class Chunks {
    /** @type {Chunks|null} */
    static _instance = null;

    /**
     *
     * @param {import("./Mix")} mix
     */
    constructor(mix) {
        this.mix = mix;

        /** @type {{[key: string]: CacheGroup}} */
        this.chunks = {};

        /** @type {import('./builder/Entry')|null} */
        this.entry = null;

        this.runtime = false;
    }

    /**
     * @return {Chunks}
     */
    static instance() {
        return Chunks._instance || (Chunks._instance = new Chunks(global.Config));
    }

    makeCurrent() {
        Chunks._instance = this;
    }

    /**
     *
     * @param {string} id A unique identifier for this chunk. Multiple chunks with the same ID are merged.
     * @param {string} path The output path for this chunk
     * @param {ChunkTest|ChunkTest[]} test A test that tells webpack how to determine what to put in this chunk
     * @param {Partial<CacheGroup>} attrs
     */
    add(id, path, test, attrs = {}) {
        this.create(id, path, attrs).addTo(id, test);
    }

    /**
     *
     * @param {string} id A unique identifier for this chunk. Multiple chunks with the same ID are merged.
     * @param {string} path The output path for this chunk
     * @param {Partial<CacheGroups>} attrs
     */
    create(id, path, attrs = {}) {
        this.chunks[id] = this.chunks[id] || {
            name: path,
            ...attrs
        };

        return this;
    }

    /**
     *
     * @param {string} idOrPath
     * @param {ChunkTest|ChunkTest[]} test
     */
    addTo(idOrPath, test) {
        const chunk = this.find(idOrPath);

        if (Array.isArray(test)) {
            test = this._checkAllTests(test);
        }

        if (chunk.test) {
            test = this._checkAnyTests([chunk.test, test]);
        }

        chunk.test = test;

        return this;
    }

    /**
     *
     * @param {string|ChunkFindCallback} idOrPath
     * @returns {CacheGroup|null}
     */
    find(idOrPath) {
        if (typeof idOrPath === 'string') {
            if (this.chunks[idOrPath]) {
                return this.chunks[idOrPath];
            }

            return this.find((_, id) => id === idOrPath);
        }

        const item = Object.entries(this.chunks).find(([id, chunk]) =>
            idOrPath(chunk, id)
        );

        return item ? item[1] : null;
    }

    config() {
        return {
            optimization: {
                ...this.runtimeChunk(),
                ...this.splitChunks()
            }
        };
    }

    runtimeChunk() {
        if (!this.runtime || !this.entry) {
            return {};
        }

        return {
            runtimeChunk: {
                name: path
                    .join(this.mix.config.runtimeChunkPath || this.entry.base, 'manifest')
                    .replace(/\\/g, '/')
            }
        };
    }

    splitChunks() {
        return {
            splitChunks: {
                ...this.cacheGroups()
            }
        };
    }

    cacheGroups() {
        return {
            cacheGroups: {
                default: false,
                defaultVendors: false,
                ...this.chunks
            }
        };
    }

    /**
     * Check to see if a chunk should be included based on multiple tests
     *
     * This is for internal use only and may be changed or removed at any time
     *
     * @internal
     *
     * @param {(undefined|boolean|string|RegExp|Function)[]} tests
     * @returns {(module: import("webpack").Module, context: CacheGroupsContext) => boolean}
     */
    _checkAllTests(tests) {
        return (module, context) =>
            tests.every(test => this._checkTest(test, module, context));
    }

    /**
     * Check to see if a chunk should be included based on multiple tests
     *
     * This is for internal use only and may be changed or removed at any time
     *
     * @internal
     *
     * @param {(undefined|boolean|string|RegExp|Function)[]} tests
     * @returns {(module: import("webpack").Module, context: CacheGroupsContext) => boolean}
     */
    _checkAnyTests(tests) {
        return (module, context) =>
            tests.some(test => this._checkTest(test, module, context));
    }

    /**
     * Check to see if a chunk should be included
     *
     * NOTE: This repeats the code from the SplitChunksPlugin checkTest function
     * This is for internal use only and may be changed or removed at any time
     *
     * @internal
     *
     * @param {undefined|boolean|string|RegExp|Function} test test option
     * @param {import("webpack").Module} module the module
     * @param {any} context context object
     * @returns {boolean} true, if the module should be selected
     */
    _checkTest(test, module, context) {
        if (this._checkModuleTest(test, module, context)) {
            return true;
        }

        if (module.issuer) {
            return this._checkTest(test, module.issuer, context);
        }

        return false;
    }

    /**
     * Check to see if a chunk should be included
     *
     * NOTE: This repeats the code from the SplitChunksPlugin checkTest function
     * This is for internal use only and may be changed or removed at any time
     *
     * @internal
     *
     * @param {undefined|boolean|string|RegExp|Function} test test option
     * @param {import("webpack").Module} module the module
     * @param {any} context context object
     * @returns {boolean} true, if the module should be selected
     */
    _checkModuleTest(test, module, context) {
        if (test === undefined) return true;
        if (typeof test === 'function') {
            return test(module, context);
        }
        if (typeof test === 'boolean') return test;
        if (typeof test === 'string') {
            const name = module.nameForCondition();

            return !!(name && name.startsWith(test));
        }
        if (test instanceof RegExp) {
            const name = module.nameForCondition();

            return !!(name && test.test(name));
        }

        return false;
    }
}

module.exports.Chunks = Chunks;
