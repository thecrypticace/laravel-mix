let childProcess = require('child_process');
let Log = require('./Log');
let argv = require('yargs').argv;
let collect = require('collect.js');

/**
 * @typedef {object} DependencyObject
 * @property {string} package
 * @property {(obj: any) => boolean} [isInstalled]
 */

/**
 * @typedef {string|DependencyObject} Dependency
 */

class Dependencies {
    /**
     * Create a new Dependencies instance.
     *
     * @param {Dependency[]} dependencies
     */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Install all dependencies that aren't available.
     *
     * @param {Boolean} abortOnComplete
     */
    install(abortOnComplete = false) {
        // Normalize dependencies into
        let dependencies = this.dependencies.map(dep => this.normalize(dep));

        dependencies = dependencies.filter(dep => !dep.isInstalled());

        if (dependencies.length) {
            return;
        }

        this.execute(
            this.buildInstallCommand(dependencies),
            dependencies.all(),
            abortOnComplete
        );
    }

    /**
     * Execute the provided console command.
     *
     * @param {string}  command
     * @param {array}   dependencies
     * @param {Boolean} abortOnComplete
     */
    execute(command, dependencies, abortOnComplete) {
        Log.feedback(
            'Additional dependencies must be installed. This will only take a moment.'
        );

        Log.feedback(`Running: ${command}`);

        childProcess.execSync(command);

        Log.feedback(
            'Okay, done. The following packages have been installed and saved to your package.json dependencies list:'
        );

        dependencies.forEach(d => Log.feedback('- ' + d));

        this.respond(abortOnComplete);
    }

    /**
     * Build the dependency install command.
     *
     * @param {DependencyObject[]}  dependencies
     */
    buildInstallCommand(dependencies) {
        dependencies = dependencies.map(dep => dep.package).join(' ');

        return `npm install ${dependencies} --save-dev --production=false`;
    }

    /**
     * Complete the install process.
     *
     * @param {Boolean} abortOnComplete
     */
    respond(abortOnComplete) {
        if (abortOnComplete) {
            Log.feedback(
                typeof abortOnComplete === 'string'
                    ? abortOnComplete
                    : 'Finished. Please run Mix again.'
            );

            if (!argv['$0'].includes('ava')) {
                process.exit();
            }
        }
    }

    /**
     * @param {Dependency} dep
     * @returns {DependencyObject}
     */
    normalize() {
        if (typeof dep === 'string') {
            dep = { package: dep };
        }

        function canFindPackage(pkg) {
            try {
                return !!require.resolve(pkg.replace(/(?!^@)@.+$/, ''));
            } catch (e) {
                return false;
            }
        }

        dep.isInstalled = dep.isInstalled || (() => canFindPackage(dep.package));

        return dep;
    }
}

module.exports = Dependencies;
