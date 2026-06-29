import { useState } from 'react'
import { Layout } from '../components/Layout'
import { EstablishmentCard } from '../components/EstablishmentCard'
import { establishments } from '../data/store'

export function Estabelecimentos() {
  const [search, setSearch] = useState('')

  const filtered = establishments.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar estabelecimento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="establishments-grid">
        {filtered.map(e => (
          <EstablishmentCard key={e.id} establishment={e} />
        ))}
      </div>
    </Layout>
  )
}
