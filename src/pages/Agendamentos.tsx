import { useState, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { AppointmentCard } from '../components/AppointmentCard'
import { getAppointments } from '../data/store'
import type { Appointment } from '../types'

export function Agendamentos() {
  const [filter, setFilter] = useState<'current' | 'past'>('current')
  const [appointments, setAppointments] = useState(getAppointments)

  const update = useCallback(() => {
    setAppointments(getAppointments())
  }, [])

  const filtered = appointments.filter(a => {
    const today = new Date().toISOString().slice(0, 10)
    return filter === 'current' ? a.date >= today && a.status !== 'cancelled' : a.date < today || a.status === 'cancelled'
  })

  const filters = (
    <div className="filter-bar">
      <button
        className={`filter-btn ${filter === 'current' ? 'active' : ''}`}
        onClick={() => setFilter('current')}
      >
        Atuais
      </button>
      <button
        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
        onClick={() => setFilter('past')}
      >
        Passados
      </button>
    </div>
  )

  return (
    <Layout headerChildren={filters}>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>Nenhum agendamento encontrado</h2>
          <p>Nenhum registro corresponde ao filtro selecionado.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map(a => (
            <AppointmentCard key={a.id} appointment={a} onUpdate={update} />
          ))}
        </div>
      )}
    </Layout>
  )
}
