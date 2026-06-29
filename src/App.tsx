import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Agendamentos } from './pages/Agendamentos'
import { Estabelecimentos } from './pages/Estabelecimentos'
import { Sobre } from './pages/Sobre'
import { PoliticaPrivacidade } from './pages/PoliticaPrivacidade'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/estabelecimentos" element={<Estabelecimentos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="*" element={<Navigate to="/agendamentos" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
