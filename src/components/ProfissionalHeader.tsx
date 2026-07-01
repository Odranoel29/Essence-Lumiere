import { useState } from 'react'
import { getProfissional, getFotoPerfil, salvarFotoPerfil, isAdminAutenticado } from '../data/store'

export function ProfissionalHeader() {
  const profissional = getProfissional()
  const [foto, setFoto] = useState(getFotoPerfil)

  function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      salvarFotoPerfil(url)
      setFoto(url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <header className="prof-header">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {foto ? (
          <img src={foto} alt={profissional.nome} className="prof-foto" />
        ) : (
          <div className="prof-foto-placeholder">
            {profissional.nome.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        {isAdminAutenticado() && (
          <>
            <label
              htmlFor="fotoUpload"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--primary)', border: '3px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 14, color: 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
              title="Alterar foto"
            >
              📷
            </label>
            <input
              id="fotoUpload"
              type="file"
              accept="image/*"
              onChange={handleFotoUpload}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>
      <h1 className="prof-nome">{profissional.nome}</h1>
      <p className="prof-subtitulo">Especialista em Estética Avançada</p>
    </header>
  )
}
