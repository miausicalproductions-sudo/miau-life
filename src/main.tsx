import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ProvedorApp } from './lib/ContextoApp'

// Tema: "auto" segue o aparelho; você pode fixar claro ou noite em Ajustes.
try {
  document.documentElement.dataset.tema = localStorage.getItem('miaulife-tema') || 'auto'
} catch {
  document.documentElement.dataset.tema = 'auto'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter: endereços com #, o jeito que funciona direito no GitHub Pages */}
    <HashRouter>
      <ProvedorApp>
        <App />
      </ProvedorApp>
    </HashRouter>
  </StrictMode>,
)
