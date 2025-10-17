import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// PrimeVue
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css' 
import ThemeSwitcher from './components/theme/ThemeSwitcher.vue';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  components: {
    panelmenu: true,
    drawer: true
  }
})


app.component('ThemeSwitcher', ThemeSwitcher);

app.mount('#app')