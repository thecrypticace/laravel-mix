import { createApp, defineAsyncComponent } from 'vue';
import ScssModule from './ScssModule.vue';

async function run() {
    console.log('run: app.js');

    const mod = await import('./dynamic.js');

    mod.default();
}

export function setupVueApp() {
    const app = createApp({
        components: {
            ScssModule,
            AsyncComponent: defineAsyncComponent(() => import('./AsyncComponent.vue'))
        },

        setup() {
            run();
        }
    });

    app.mount('#app');
}
