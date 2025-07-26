import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';

import 'bootstrap/dist/css/bootstrap.css';
import '@/assets/main.css';
import '@fortawesome/fontawesome-free/css/all.css';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  },
});

app.mount('#app');
