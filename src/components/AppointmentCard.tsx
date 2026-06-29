import type { Appointment } from '../types'
import { cancelAppointment } from '../data/store'

interface Props {
  appointment: Appointment
  onUpdate: () => void
}

const statusLabels: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmado', className: 'status-confirmed' },
  pending: { label: 'Pendente', className: 'status-pending' },
  cancelled: { label: 'Cancelado', className: 'status-cancelled' },
  completed: { label: 'Realizado', className: 'status-completed' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

export function AppointmentCard({ appointment, onUpdate }: Props) {
  const status = statusLabels[appointment.status] ?? statusLabels.pending

  function handleCancel() {
    if (!window.confirm('Cancelar este agendamento?')) return
    cancelAppointment(appointment.id)
    onUpdate()
  }

  return (
    <div className="appointment-card">
      <div className="card-left">
        <div className="card-date">
          <span className="date-day">{appointment.date.slice(8)}</span>
          <span className="date-month">{formatDate(appointment.date).split(' ')[1]}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h3>{appointment.service}</h3>
          <span className={`status-badge ${status.className}`}>{status.label}</span>
        </div>
        <p className="card-professional">Com {appointment.professional}</p>
        <p className="card-time">
          {appointment.date} às {appointment.time}
        </p>
        <p className="card-address">{appointment.address}</p>
      </div>

      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
        <div className="card-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
