import type { Appointment, Establishment, User } from '../types'

const STORAGE_KEYS = {
  APPOINTMENTS: 'essence_appointments',
  USER: 'essence_user',
} as const

export function getAppointments(): Appointment[] {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)
  return data ? JSON.parse(data) : defaultAppointments
}

export function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
}

export function getUser(): User {
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : defaultUser
}

export function saveUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function cancelAppointment(id: string) {
  const appointments = getAppointments()
  const updated = appointments.map(a =>
    a.id === id ? { ...a, status: 'cancelled' as const } : a
  )
  saveAppointments(updated)
  return updated
}

export function addAppointment(appointment: Appointment) {
  const appointments = getAppointments()
  appointments.unshift(appointment)
  saveAppointments(appointments)
  return appointments
}

export const establishments: Establishment[] = [
  {
    id: '1',
    name: 'Essence Lumiere',
    category: 'Clínica de Estética',
    rating: 4.9,
    address: 'Rua Principal, 123 - Centro',
    phone: '(11) 99999-8888',
    image: '',
    services: ['Limpeza de Pele', 'Depilação a Laser', 'Massagem Modeladora', 'Drenagem Linfática', 'Peeling'],
    professionals: ['Dra. Carla Mendes', 'Fernanda Oliveira', 'Juliana Costa'],
    available: true,
  },
  {
    id: '2',
    name: 'Studio Beleza Pura',
    category: 'Salão de Beleza',
    rating: 4.7,
    address: 'Av. das Flores, 456 - Jardins',
    phone: '(11) 98888-7777',
    image: '',
    services: ['Corte Feminino', 'Coloração', 'Escova', 'Hidratação', 'Unhas'],
    professionals: ['Maria Silva', 'Ana Beatriz', 'Lucas Santos'],
    available: true,
  },
]

const defaultAppointments: Appointment[] = [
  {
    id: '1',
    service: 'Limpeza de Pele',
    professional: 'Dra. Carla Mendes',
    date: '2026-07-02',
    time: '14:30',
    status: 'confirmed',
    address: 'Rua Principal, 123 - Centro',
  },
  {
    id: '2',
    service: 'Massagem Modeladora',
    professional: 'Fernanda Oliveira',
    date: '2026-07-05',
    time: '10:00',
    status: 'confirmed',
    address: 'Rua Principal, 123 - Centro',
  },
  {
    id: '3',
    service: 'Depilação a Laser',
    professional: 'Juliana Costa',
    date: '2026-06-25',
    time: '16:00',
    status: 'completed',
    address: 'Rua Principal, 123 - Centro',
  },
  {
    id: '4',
    service: 'Drenagem Linfática',
    professional: 'Fernanda Oliveira',
    date: '2026-06-20',
    time: '09:00',
    status: 'completed',
    address: 'Rua Principal, 123 - Centro',
  },
]

const defaultUser: User = {
  name: 'Leonardo Mello',
  email: 'leosmello93@gmail.com',
  phone: '(11) 97777-6666',
  avatar: 'L',
}
