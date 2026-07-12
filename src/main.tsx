import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import App from './App.tsx'
import { restoreProject, startAutosave } from './store/autosave.ts'

restoreProject(localStorage)
startAutosave(localStorage)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
