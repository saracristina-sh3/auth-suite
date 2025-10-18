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


const sh3Colors = definePreset(Aura, {
  semantic: {
    primary: {
      50: "var(--selenium-50)",
      100: "var(--selenium-100)",
      200: "var(--selenium-200)",
      300: "var(--selenium-300)",
      400: "var(--selenium-400)",
      500: "var(--selenium-500)",
      600: "var(--selenium-600)",
      700: "var(--selenium-700)",
      800: "var(--selenium-800)",
      900: "var(--selenium-900)",
      950: "var(--selenium-950)",
    },
    secondary: {
      50: "var(--copper-50)",
      100: "var(--copper-100)",
      200: "var(--copper-200)",
      300: "var(--copper-300)",
      400: "var(--copper-400)",
      500: "var(--copper-500)",
      600: "var(--copper-600)",
      700: "var(--copper-700)",
      800: "var(--copper-800)",
      900: "var(--copper-900)",
      950: "var(--copper-950)",
    },
    colorScheme: {
      light: {
        primary: {
          color: '{selenium.950}',
          inverseColor: '#ffffff',
          hoverColor: '{selenium.900}',
          activeColor: '{selenium.800}'
        },
        highlight: {
          background: '{selenium.950}',
          focusBackground: '{selenium.700}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          color: '{selenium.50}',
          inverseColor: '{selenium.950}',
          hoverColor: '{selenium.100}',
          activeColor: '{selenium.200}'
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)'
        }
      }
    }
  }
})
const Noir = sh3Colors;


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
        preset: Noir,
        options: {
            prefix: 'my',
            darkModeSelector: false,
            cssLayer: {
            name: 'primevue',
            order: 'app-styles, primevue, another-css-library'
            }
    },
          },
  components: {
    panelmenu: true,
    drawer: true
  }
})


app.component('ThemeSwitcher', ThemeSwitcher);

app.mount('#app')