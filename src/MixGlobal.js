const Log = require('./Log');

function isInternalUse() {
    // - isInternalUse
    // - showWarning
    // - Object.get
    const framesToCut = 3;

    const stack = new Error().stack || '';
    const lines = stack.split('\n').slice(framesToCut + 1);
    const allowed = ['laravel-mix/src', 'laravel-mix\\src'];

    if (!(lines.findIndex(line => allowed.some(a => line.includes(a))) === 0)) {
        console.log(lines);
    }

    return lines.findIndex(line => allowed.some(a => line.includes(a))) === 0;
}

/**
 * @internal
 * @deprecated
 *
 * @template T
 * @param {T & object} target
 * @param {boolean} shouldWarn
 * @returns {T & object}
 */
function wrapGlobal(target, shouldWarn) {
    let hasWarned = false;

    function showWarning() {
        if (
            !shouldWarn ||
            hasWarned ||
            process.env.NO_MIX_INTERNALS_WARNING ||
            isInternalUse()
        ) {
            return;
        }

        hasWarned = true;

        Log.messages([
            {
                type: 'warn',
                text:
                    'You are using a mix plugin that relies on implicit global usage of internal files.'
            },
            {
                type: 'error',
                text: new Error().stack || ''
            }
        ]);
    }

    return new Proxy(target, {
        get(target, key) {
            showWarning();

            // @ts-ignore
            return target[key];
        }
    });
}

module.exports.wrapGlobal = wrapGlobal;
