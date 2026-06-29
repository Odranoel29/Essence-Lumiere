import { Layout } from '../components/Layout'

export function PoliticaPrivacidade() {
  return (
    <Layout>
      <div className="privacy-page">
        <h2>Política de Privacidade</h2>

        <section>
          <h3>1. Coleta de Dados</h3>
          <p>
            Coletamos informações pessoais como nome, e-mail e telefone para
            gerenciamento de agendamentos. Seus dados são armazenados com segurança
            e utilizados apenas para os fins da plataforma.
          </p>
        </section>

        <section>
          <h3>2. Uso das Informações</h3>
          <p>
            As informações coletadas são utilizadas para:
          </p>
          <ul>
            <li>Gerenciar seus agendamentos</li>
            <li>Enviar lembretes e confirmações</li>
            <li>Melhorar nossos serviços</li>
            <li>Comunicação sobre seus horários</li>
          </ul>
        </section>

        <section>
          <h3>3. Armazenamento</h3>
          <p>
            Seus dados são armazenados localmente no seu dispositivo (localStorage)
            e não são compartilhados com terceiros sem seu consentimento.
          </p>
        </section>

        <section>
          <h3>4. Contato</h3>
          <p>
            Para dúvidas sobre esta política, entre em contato:
            privacidade@essencelumiere.com.br
          </p>
        </section>
      </div>
    </Layout>
  )
}
