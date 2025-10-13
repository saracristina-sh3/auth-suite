import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Card from 'primevue/card'
import PanelMenu from 'primevue/panelmenu'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

// Registre os componentes individualmente - use 'Card' como nome
app.component('Card', Card)
app.component('PanelMenu', PanelMenu)

app.mount('#app')
