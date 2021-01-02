let Log = require('./Log');

class VueVersion {
    /**
     * Vue versions that are supported by Mix.
     *
     * @returns {number[]}
     */
    static supported() {
        return [2, 3];
    }

    /**
     * Detect and validate the current version of Vue for the build.
     *
     * @param {string|number|null|undefined} version
     * @returns {number}
     */
    static detect(version) {
        version = parseInt(`${version}`);

        if (!version) {
            try {
                return VueVersion.detect(require('vue').version);
            } catch (e) {
                VueVersion.fail();
            }
        }

        if (VueVersion.supported().includes(version)) {
            return version;
        }

        VueVersion.fail();
    }

    /**
     * Abort and log that a supported version of Vue wasn't found.
     *
     * @throws {Error}
     * @returns {never}
     */
    static fail() {
        Log.error(
            `We couldn't find a supported version of Vue in your project. ` +
                `Please ensure that it's installed (npm install vue).`
        );

        throw new Error();
    }
}

module.exports = VueVersion;
