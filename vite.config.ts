import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function gtmPlugin(): Plugin {
  const gtmId = process.env.VITE_GTM_ID
  return {
    name: 'inject-gtm',
    transformIndexHtml(html) {
      if (!gtmId) return html

      const headScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`

      const bodyNoscript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`

      return html
        .replace('</head>', `${headScript}\n</head>`)
        .replace(/<body([^>]*)>/, `<body$1>\n${bodyNoscript}`)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gtmPlugin()],
  // Set base path - will be overridden by GitHub Actions
  // For custom domain: use '/'
  // For github.io/repo-name: use '/repo-name/'
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
  },
})
