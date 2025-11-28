import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'KINTSUGI MIND'}</title>
        <meta name="description" content="The Japanese Art of Resilience - Transform your anxiety into strength through ancient wisdom" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a5f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="金継ぎ" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Google Fonts - Noto Serif JP + Cormorant Garamond */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Noto+Serif+JP:wght@300;400;500;600&display=swap" rel="stylesheet" />
        
        {/* Custom Tailwind Config for Wa Design System */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    // Wa (和) Design System Colors
                    indigo: {
                      DEFAULT: '#1e3a5f',    // 藍色 - Primary
                      50: '#f0f4f8',
                      100: '#d9e2ec',
                      200: '#bcccdc',
                      300: '#9fb3c8',
                      400: '#829ab1',
                      500: '#627d98',
                      600: '#486581',
                      700: '#334e68',
                      800: '#1e3a5f',
                      900: '#0d1f33',
                    },
                    ecru: {
                      DEFAULT: '#f5f0e8',    // 生成り - Background
                      50: '#fdfcfa',
                      100: '#faf8f4',
                      200: '#f5f0e8',
                      300: '#ebe3d5',
                      400: '#ddd2be',
                      500: '#c9b99c',
                      600: '#b09e7d',
                      700: '#8f7d5e',
                      800: '#6b5d46',
                      900: '#4a4030',
                    },
                    gold: {
                      DEFAULT: '#c9a227',    // 金 - Accent/Kintsugi
                      50: '#fef9e7',
                      100: '#fcf0c3',
                      200: '#f9e49b',
                      300: '#f5d56f',
                      400: '#e8c341',
                      500: '#c9a227',
                      600: '#a6851f',
                      700: '#836818',
                      800: '#614d12',
                      900: '#40330c',
                    },
                    ink: {
                      DEFAULT: '#1a1a1a',    // 墨 - Text
                      50: '#f5f5f5',
                      100: '#e0e0e0',
                      200: '#bdbdbd',
                      300: '#9e9e9e',
                      400: '#757575',
                      500: '#616161',
                      600: '#424242',
                      700: '#303030',
                      800: '#212121',
                      900: '#1a1a1a',
                    }
                  },
                  fontFamily: {
                    serif: ['Cormorant Garamond', 'Noto Serif JP', 'serif'],
                    jp: ['Noto Serif JP', 'serif'],
                  },
                  animation: {
                    'float': 'float 6s ease-in-out infinite',
                    'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    'fade-in': 'fadeIn 0.8s ease-out forwards',
                    'slide-up': 'slideUp 0.6s ease-out forwards',
                    'breathe': 'breathe 4s ease-in-out infinite',
                    'grow': 'grow 0.5s ease-out forwards',
                    'spin-once': 'spinOnce 0.3s ease-out',
                  },
                  keyframes: {
                    float: {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                    },
                    fadeIn: {
                      '0%': { opacity: '0' },
                      '100%': { opacity: '1' },
                    },
                    slideUp: {
                      '0%': { opacity: '0', transform: 'translateY(20px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                    breathe: {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                    },
                    grow: {
                      '0%': { transform: 'scale(0.8)', opacity: '0' },
                      '100%': { transform: 'scale(1)', opacity: '1' },
                    },
                    spinOnce: {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }
                }
              }
            }
          `
        }} />
        
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-ecru text-ink font-serif min-h-screen">
        {children}
        <script src="/static/soundscape.js"></script>
        <script src="/static/app.js"></script>
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('[PWA] Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('[PWA] Service Worker registration failed:', error);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  )
})
