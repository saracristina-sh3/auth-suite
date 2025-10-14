import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import { Select, Card, PanelMenu, Avatar } from 'primevue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

// Registre os componentes individualmente - use 'Card' como nome
app.component('Card', Card)
app.component('PanelMenu', PanelMenu)
app.component('Avatar', Avatar)
app.component('Select', Select)

app.mount('#app')
