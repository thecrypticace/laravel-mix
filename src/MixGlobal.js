let hasWarned = false;

/**
 * @internal
 * @deprecated
 * @returns {import("./Mix")}
 */
const getGlobalMix = ({ warn } = { warn: true }) => {
    if (warn && !hasWarned && !process.env.NO_MIX_INTERNALS_WARNING) {
        hasWarned = true;

        console.warn(
            'You are using a mix plugin that relies on implicit global usage of internal files.'
        );

        console.log(new Error().stack);
    }

    // @ts-ignore
    return global.Mix;
};

module.exports.getGlobalMix = getGlobalMix;
