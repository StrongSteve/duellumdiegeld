import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { migrateFromLegacyStorage } from './utils/playedQuestionsDb'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Migrate old cookie/localStorage data to IndexedDB (runs once)
migrateFromLegacyStorage().catch(console.error)

app.mount('#app')
