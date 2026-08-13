import { Clock3, Database, LockKeyhole, Network, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './PrivacyPage.module.css';

const sections = [
  {
    title: 'Privacidade com propósito',
    icon: ShieldCheck,
    accent: 'violet',
    body: 'O We Better existe para apoiar sua evolução pessoal, não para explorar a sua história. Este aviso explica, de forma direta, como cuidamos das informações que tornam seu espaço pessoal possível.',
  },
  {
    title: 'O que guardamos',
    icon: Database,
    accent: 'pink',
    bullets: [
      'Dados de conta, como nome, e-mail e identificador de autenticação.',
      'Conteúdo que você escolhe registrar: metas, hábitos, missões, roda da vida, Dream Board e preferências.',
    ],
  },
  {
    title: 'Como usamos',
    icon: UserRoundCheck,
    accent: 'blue',
    body: 'Usamos esses dados para entregar o seu espaço, salvar progresso, personalizar recursos, proteger sua conta e responder a solicitações. O We Better não vende o conteúdo da sua jornada a anunciantes.',
  },
  {
    title: 'Com quem compartilhamos',
    icon: Network,
    accent: 'orange',
    body: 'Somente com fornecedores que ajudam a operar o produto: Supabase para autenticação e dados, Stripe para pagamentos, Vercel para hospedagem e Typebot quando o onboarding conversacional está habilitado.',
  },
  {
    title: 'Segurança e retenção',
    icon: LockKeyhole,
    accent: 'green',
    body: 'Aplicamos controles de acesso e tratamos apenas o necessário. Mantemos dados enquanto sua conta estiver ativa e pelo período necessário para segurança, obrigações legais e resolução de disputas.',
  },
  {
    title: 'Você mantém o controle',
    icon: Clock3,
    accent: 'teal',
    body: 'Em Configurações > Conta, você pode exportar seus dados ou solicitar a exclusão da conta. Você também pode ajustar permissões de notificações pelo navegador quando quiser.',
  },
];

const PrivacyPage = (): JSX.Element => {
  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="privacy-title">
        <Link className={styles.backLink} to="/">
          ← Voltar ao We Better
        </Link>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Privacidade no We Better</span>
          <h1 id="privacy-title">Seu caminho é seu.</h1>
          <p>
            Clareza sobre os dados que tornam sua jornada possível, os limites que adotamos e os
            controles que permanecem nas suas mãos.
          </p>
          <span className={styles.metadata}>Vigente desde 17 de julho de 2026</span>
        </header>

        <div className={styles.contentGrid}>
          {sections.map(({ title, icon: Icon, accent, body, bullets }) => (
            <article className={`${styles.card} ${styles[accent]}`} key={title}>
              <div className={styles.iconWrap}>
                <Icon aria-hidden="true" size={27} strokeWidth={1.8} />
              </div>
              <div>
                <h2>{title}</h2>
                {body && <p>{body}</p>}
                {bullets && (
                  <ul>
                    {bullets.map(bullet => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <aside className={styles.footerCard}>
          <div>
            <h2>Quer ver o aviso completo?</h2>
            <p>
              Leia os detalhes sobre bases legais, direitos previstos na LGPD, cookies e contato de
              privacidade.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/cookies">Política de Cookies</Link>
            <Link to="/contact">Falar com o We Better</Link>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default PrivacyPage;
