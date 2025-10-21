/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================================
        // Cores Semânticas - Usando CSS Variables
        // ============================================================================

        // Primária (Jade - Verde-azulado)
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',

        // Secundária (Selenium - Azul)
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',

        // Base
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Cards e Superfícies
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',

        // Estados
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',

        // Destrutivo
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',

        // Bordas e Inputs
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // ============================================================================
        // Paleta SH3 - Cores da Marca
        // ============================================================================

        // Selenium (Azul) - Secundária
        selenium: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // Copper (Laranja)
        copper: {
          50: '#fef7ee',
          100: '#fdedd5',
          200: '#fbd8ab',
          300: '#f8bb76',
          400: '#f49340',
          500: '#f1731a',
          600: '#e25710',
          700: '#bc3f10',
          800: '#953314',
          900: '#782c14',
          950: '#411409',
        },

        // Jade (Verde-azulado) - Primária
        jade: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },

        // Ruby (Vermelho) - Erro/Destrutivo
        ruby: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },

        // Sulfur (Amarelo) - Aviso
        sulfur: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },

        // ============================================================================
        // Cores de Módulos
        // ============================================================================

        // Contabilidade
        contabil: {
          50: '#f0f8fb',
          100: '#d9eef4',
          200: '#b8dce9',
          300: '#87c3d9',
          400: '#4ea0c2',
          500: '#3282a5',
          600: '#2d6b8d',
          700: '#2a5874',
          800: '#2a4a60',
          900: '#273f52',
          950: '#152837',
        },

        // Pessoal
        pessoal: {
          50: '#f1fafa',
          100: '#dbf1f2',
          200: '#bae3e7',
          300: '#8bcfd5',
          400: '#54b1bc',
          500: '#3995a1',
          600: '#327988',
          700: '#2e6470',
          800: '#2d535d',
          900: '#294650',
          950: '#1d3a44',
        },

        // Cores Tailwind padrão (fallback)
        ...colors,
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 1px 3px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
