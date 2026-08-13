import { useState } from 'react';
import { HelpCircle, Minus, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './FaqPage.module.css';

const questions = [
  {
    question: 'O que é o We Better?',
    answer:
      'O We Better é o seu espaço para transformar intenção em prática. Ele reúne visão de futuro, metas, hábitos, missões e reflexões para que você consiga enxergar o próximo passo — e voltar a ele todos os dias.',
  },
  {
    question: 'Por onde eu começo?',
    answer:
      'Comece pelo onboarding: conte o que importa para você e escolha uma direção. Depois, use o Dashboard como ponto de partida. O guia interativo pode ser reaberto sempre que quiser pelo botão de ajuda da página.',
  },
  {
    question: 'Como funciona o Dream Board?',
    answer:
      'O Dream Board transforma aquilo que você quer viver em uma visão concreta. Adicione sonhos, imagens, marcos e pequenas ações; use-o para conectar o que inspira você às decisões que toma agora.',
  },
  {
    question: 'O que é a Life Wheel?',
    answer:
      'A Roda da Vida ajuda você a observar áreas importantes da sua vida em conjunto — sem reduzir seu progresso a uma única nota. Atualize suas percepções ao longo do tempo para notar onde quer colocar mais atenção.',
  },
  {
    question: 'Como as Missions me ajudam?',
    answer:
      'Missões são convites práticos para sair da intenção e entrar em movimento. Você pode iniciar uma missão, acompanhar o que está em andamento e celebrar o que concluiu, no seu próprio ritmo.',
  },
  {
    question: 'Posso acompanhar hábitos e metas?',
    answer:
      'Sim. Crie hábitos para o que quer repetir e metas para o que quer construir. O We Better organiza marcos e progresso para que projetos maiores não fiquem abstratos demais.',
  },
  {
    question: 'Como funcionam lembretes e notificações?',
    answer:
      'Você escolhe quais lembretes quer receber e quando. As notificações do navegador só são ativadas depois da sua permissão e podem ser desativadas nas configurações do navegador ou da plataforma.',
  },
  {
    question: 'Meus dados ficam privados?',
    answer:
      'Seu espaço é pessoal. Usamos seus dados para operar e personalizar a plataforma, não para vender seu conteúdo a anunciantes. Consulte nosso Aviso de Privacidade para saber quais dados tratamos e com quais fornecedores.',
  },
  {
    question: 'Consigo exportar ou excluir minha conta?',
    answer:
      'Sim. Em Configurações > Conta, você pode solicitar uma exportação dos seus dados ou iniciar a exclusão da conta. Se houver uma assinatura ativa, cancele-a antes de excluir a conta.',
  },
  {
    question: 'Como gerencio meu plano?',
    answer:
      'Planos, pagamentos, faturas e cancelamento ficam em Configurações > Plano e cobrança. O checkout e o portal de cobrança são processados pelo Stripe.',
  },
];

const FaqPage = (): JSX.Element => {
  const [openQuestion, setOpenQuestion] = useState<number>(0);

  const toggleQuestion = (index: number): void => {
    setOpenQuestion(current => (current === index ? -1 : index));
  };

  return (
    <main className={styles.page}>
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <section className={styles.shell} aria-labelledby="faq-title">
        <div className={styles.hero}>
          <Link className={styles.backLink} to="/">
            ← Voltar ao We Better
          </Link>
          <div className={styles.badge}>
            <HelpCircle size={16} aria-hidden="true" />
            Central de ajuda
          </div>
          <h1 id="faq-title">Perguntas que abrem caminho.</h1>
          <p>
            Respostas rápidas para usar o We Better com mais clareza — do primeiro passo às
            configurações da sua conta.
          </p>
        </div>

        <div className={styles.faqGrid}>
          {questions.map((item, index) => {
            const isOpen = openQuestion === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article
                className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
                key={item.question}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span>{item.question}</span>
                  {isOpen ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
                </button>
                {isOpen && (
                  <div className={styles.answer} id={answerId}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className={styles.helpCard}>
          <Sparkles aria-hidden="true" />
          <div>
            <h2>Não encontrou o que precisava?</h2>
            <p>Veja os caminhos de suporte, privacidade e contato do We Better.</p>
          </div>
          <Link to="/support">Ir para suporte</Link>
        </aside>
      </section>
    </main>
  );
};

export default FaqPage;
