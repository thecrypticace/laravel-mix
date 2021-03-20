class DisableNotifications {
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
        return ['disableNotifications', 'disableSuccessNotifications'];
    }

    /**
     * Register the component.
     */
    register() {
        if (this.caller === 'disableSuccessNotifications') {
            this.context.config.notifications = {
                onSuccess: false,
                onFailure: true
            };
        } else {
            this.context.config.notifications = false;
        }
    }
}

module.exports = DisableNotifications;
