import { Layout } from '../components/Layout'

export function Sobre() {
  return (
    <Layout>
      <div className="about-page">
        <div className="about-hero">
          <h2>Essence Lumiere</h2>
          <p>Sua beleza, nossa essência</p>
        </div>

        <section className="about-section">
          <h3>Quem somos</h3>
          <p>
            A Essence Lumiere é uma clínica de estética dedicada a realçar sua beleza natural.
            Com profissionais altamente qualificados e equipamentos modernos, oferecemos
            tratamentos personalizados para cada tipo de pele e necessidade.
          </p>
        </section>

        <section className="about-section">
          <h3>Nossos serviços</h3>
          <ul>
            <li>Limpeza de Pele</li>
            <li>Depilação a Laser</li>
            <li>Massagem Modeladora</li>
            <li>Drenagem Linfática</li>
            <li>Peeling</li>
            <li>Microagulhamento</li>
          </ul>
        </section>

        <section className="about-section">
          <h3>Funcionalidades do App</h3>
          <ul>
            <li>✅ Agende seus horários de forma prática</li>
            <li>✅ Visualize seus agendamentos futuros e passados</li>
            <li>✅ Receba lembretes dos seus horários</li>
            <li>✅ Cancele ou reagende quando precisar</li>
            <li>✅ Conheça nossos profissionais e serviços</li>
            <li>✅ Entre em contato via WhatsApp</li>
          </ul>
        </section>

        <section className="about-section">
          <h3>Contato</h3>
          <p>📞 (11) 99999-8888</p>
          <p>📍 Rua Principal, 123 - Centro</p>
          <p>📧 contato@essencelumiere.com.br</p>
        </section>
      </div>
    </Layout>
  )
}
