<template>
    <div id="asset-module">
        <img id="asset-img" src=".,/images/laravel.png" />
    </div>
</template>

<script>
import { onMounted } from 'vue';

export default {
    setup() {
        onMounted(async () => {
            /** @type {HTMLImageElement|null} */
            const img = document.querySelector('#asset-img');

            await new Promise(resolve => img?.addEventListener('load', resolve));

            console.log(`asset image width: ${img?.naturalWidth}x${img?.naturalHeight}`);
        });
    }
};
</script>
