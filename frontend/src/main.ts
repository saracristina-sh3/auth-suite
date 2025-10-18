import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { definePreset } from '@primeuix/themes';

// PrimeVue
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css' 
import ThemeSwitcher from './components/theme/ThemeSwitcher.vue';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
semantic: {
        colorScheme: {
          light: {
      surface: {
        0: "#ffffff",
        50: "{slate.50}",
        100: "{slate.100}",
        200: "{slate.200}",
        300: "{slate.300}",
        400: "{slate.400}",
        500: "{slate.500}",
        600: "{slate.600}",
        700: "{slate.700}",
        800: "{slate.800}",
        900: "{slate.900}",
        950: "{slate.950}",
      },
      primary: {
        color: "{primary.500}",
        contrastColor: "#ffffff",
        hoverColor: "{primary.600}",
        activeColor: "{primary.700}",
      },
      highlight: {
        background: "{primary.50}",
        focusBackground: "{primary.100}",
        color: "{primary.700}",
        focusColor: "{primary.800}",
      },
      mask: {
        background: "rgba(0,0,0,0.4)",
        color: "{surface.200}",
      },
          }
        }
      }
        });

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
        preset: MyPreset,
        options: {
            prefix: 'my',
            darkModeSelector: 'system',
 name: 'primevue',
        order: 'app-styles, primevue, another-css-library'
    },
          },
  components: {
    panelmenu: true,
    drawer: true
  }
})


app.component('ThemeSwitcher', ThemeSwitcher);

app.mount('#app')