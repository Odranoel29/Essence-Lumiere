import type { Establishment } from '../types'

interface Props {
  establishment: Establishment
}

export function EstablishmentCard({ establishment }: Props) {
  return (
    <div className="establishment-card">
      <div className="est-header">
        <h3>{establishment.name}</h3>
        <span className="est-rating">★ {establishment.rating}</span>
      </div>
      <p className="est-category">{establishment.category}</p>
      <p className="est-address">{establishment.address}</p>

      <div className="est-section">
        <strong>Serviços:</strong>
        <div className="est-tags">
          {establishment.services.map(s => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
      </div>

      <div className="est-section">
        <strong>Profissionais:</strong>
        <div className="est-tags">
          {establishment.professionals.map(p => (
            <span key={p} className="tag tag-prof">{p}</span>
          ))}
        </div>
      </div>

      <div className="est-actions">
        <a href={`https://wa.me/5511999998888`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          Agendar via WhatsApp
        </a>
      </div>
    </div>
  )
}
