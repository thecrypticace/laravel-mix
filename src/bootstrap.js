const { Context } = require('./Context');

require('./helpers');

/**
 * Boot the Mix framework.
 *
 * @returns {typeof import('../types/index')}
 */
module.exports = () => {
    let context = new Context();

    context.boot();
    context.makeCurrent();

    return context.api();
};
