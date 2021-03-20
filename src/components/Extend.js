class Extend {
    /**
     * @param {import('../Mix')} context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * Register the component.
     *
     * @param {string} name
     * @param {Component} component
     */
    register(name, component) {
        if (typeof component !== 'function') {
            component.name = () => name;

            return this.context.registrar.install(component);
        }

        this.context.registrar.install({
            name: () => name,

            register(...args) {
                this.args = args;
            },

            webpackConfig(config) {
                component.call(this, config, ...this.args);
            }
        });
    }
}

module.exports = Extend;
