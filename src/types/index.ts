export interface Appointment {
  id: string
  service: string
  professional: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  address: string
  notes?: string
}

export interface Establishment {
  id: string
  name: string
  category: string
  rating: number
  address: string
  phone: string
  image: string
  services: string[]
  professionals: string[]
  available: boolean
}

export interface User {
  name: string
  email: string
  phone: string
  avatar: string
}
