import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n';
import './style.css'; // Tailwind CSS import

createApp(App).use(i18n).mount('#app');