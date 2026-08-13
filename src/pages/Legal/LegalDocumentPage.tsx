import { Link, useLocation } from 'react-router-dom';
import { APP_ORIGIN } from '@/core/config/appUrl';
import styles from './LegalDocumentPage.module.css';

type DocumentId = 'privacy' | 'terms' | 'cookies' | 'support' | 'contact' | 'dmca' | 'legal-notice';

interface LegalDocument {
  id: DocumentId;
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
}

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
const effectiveDate = '17 de julho de 2026';
const reviewDate = '17 de julho de 2027';
const productUrl = APP_ORIGIN;

const documents: Record<DocumentId, LegalDocument> = {
  privacy: {
    id: 'privacy',
    eyebrow: 'Privacidade',
    title: 'Aviso de Privacidade',
    summary:
      'Transparência sobre os dados que tornam sua jornada de evolução possível — e sobre os limites que adotamos para protegê-los.',
    sections: [
      {
        title: '1. Quem é responsável',
        paragraphs: [
          'We Better Ltd. é a responsável pelo tratamento dos dados pessoais descritos neste aviso ao oferecer a plataforma We Better. Para efeitos da LGPD, atuamos como controladora quando definimos a finalidade e os meios desse tratamento.',
          'Este texto se aplica ao site, ao aplicativo web e aos canais de atendimento do We Better. Ele não substitui os avisos de provedores independentes, como Stripe, Supabase e Typebot, quando você interage diretamente com eles.',
        ],
      },
      {
        title: '2. Dados que usamos e por quê',
        paragraphs: [
          'Coletamos somente o necessário para entregar uma experiência de planejamento pessoal, segurança da conta e cobrança.',
        ],
        bullets: [
          'Conta: nome, e-mail, identificador de autenticação e dados técnicos de sessão para criar, proteger e administrar seu acesso.',
          'Jornada na plataforma: respostas do onboarding, objetivos, hábitos, registros de humor, missões, itens do Dream Board, preferências e notificações. Usamos esses dados para exibir, salvar e personalizar seu espaço; não para diagnosticar sua saúde.',
          'Cobrança: plano, status da assinatura, identificadores de cliente e de transação. Os dados completos de cartão são tratados pelo Stripe, não pelo We Better.',
          'Suporte e segurança: mensagens que você nos envia, registros de erro e dados técnicos indispensáveis para responder, prevenir fraude e manter o serviço confiável.',
        ],
      },
      {
        title: '3. Bases, compartilhamentos e transferências',
        paragraphs: [
          'Tratamos dados para executar o contrato quando você usa a plataforma, cumprir obrigações legais, proteger a conta e, quando aplicável, com seu consentimento — por exemplo, para notificações do navegador. Você pode revogar permissões do navegador a qualquer momento.',
          'Utilizamos fornecedores que operam serviços em nosso nome: Supabase para autenticação e dados da aplicação, Stripe para pagamentos, Vercel para hospedagem e, quando o onboarding conversacional estiver habilitado, Typebot. Eles recebem apenas o necessário para sua função e podem processar dados fora do Brasil sob as salvaguardas aplicáveis.',
          'Não vendemos seus dados pessoais nem disponibilizamos o conteúdo da sua jornada a anunciantes.',
        ],
      },
      {
        title: '4. Retenção, exclusão e seus controles',
        paragraphs: [
          'Mantemos dados enquanto sua conta estiver ativa e pelo período necessário para as finalidades deste aviso, para obrigações legais, resolução de disputas e segurança. Você pode exportar seus dados e solicitar a exclusão em Configurações > Conta. Uma assinatura ativa deve ser cancelada antes da exclusão.',
          'A exclusão remove dados operacionais da conta; cópias de segurança e registros que precisem ser retidos por obrigação legal ou segurança são eliminados conforme seus ciclos de retenção ou mantidos apenas pelo prazo legalmente necessário.',
        ],
      },
      {
        title: '5. Seus direitos e contato',
        paragraphs: [
          'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação quando aplicável, portabilidade, informação sobre compartilhamentos, revogação do consentimento e revisão de decisões automatizadas nos termos da LGPD.',
          supportEmail
            ? `Para exercer direitos ou falar sobre privacidade, escreva para ${supportEmail}. Podemos pedir informações proporcionais para confirmar sua identidade e proteger sua conta.`
            : 'O canal de privacidade ainda precisa ser configurado pelo responsável do We Better antes do lançamento. Não publique esta versão sem um contato de privacidade funcional.',
        ],
      },
    ],
  },
  terms: {
    id: 'terms',
    eyebrow: 'Uso da plataforma',
    title: 'Termos de Serviço',
    summary: 'As regras para usar o We Better com autonomia, respeito e expectativas claras.',
    sections: [
      {
        title: '1. O que o We Better oferece',
        paragraphs: [
          'O We Better é uma plataforma de desenvolvimento pessoal: ela ajuda você a organizar metas, hábitos, missões, reflexões e uma visão de futuro. O conteúdo e as sugestões servem como ferramentas de reflexão e organização.',
          'O We Better não presta aconselhamento médico, psicológico, jurídico, financeiro ou de emergência. Se você estiver em risco, em sofrimento intenso ou precisar de cuidado profissional, procure o serviço de saúde ou emergência adequado à sua localidade.',
        ],
      },
      {
        title: '2. Sua conta e seu conteúdo',
        paragraphs: [
          'Você é responsável por manter suas credenciais seguras e por usar informações verdadeiras ao criar a conta. Não compartilhe seu acesso nem tente acessar a conta de outra pessoa.',
          'Você mantém os direitos sobre o conteúdo que cria. Você nos concede a permissão limitada necessária para hospedar, processar e exibir esse conteúdo exclusivamente para operar e melhorar a segurança da plataforma.',
        ],
      },
      {
        title: '3. Uso responsável',
        paragraphs: [
          'Não use o We Better para violar direitos, enviar conteúdo ilegal ou prejudicial, contornar controles de segurança, explorar a infraestrutura ou interferir na experiência de outras pessoas.',
        ],
      },
      {
        title: '4. Planos e cobrança',
        paragraphs: [
          'Os recursos pagos, preços, moeda, período de cobrança e impostos aplicáveis são mostrados antes do checkout. Pagamentos e gestão de assinatura são processados pelo Stripe.',
          'Você pode gerenciar ou cancelar uma assinatura na área de cobrança. O cancelamento evita a renovação futura e, salvo informação diferente no checkout ou exigência legal, o acesso pago permanece até o final do período já pago. Reembolsos obedecem à lei aplicável e às condições informadas na contratação.',
        ],
      },
      {
        title: '5. Alterações, disponibilidade e encerramento',
        paragraphs: [
          'Podemos evoluir recursos, corrigir falhas ou suspender temporariamente o serviço para manutenção e segurança. Sempre que uma mudança relevante afetar seus direitos ou o preço de uma assinatura, forneceremos o aviso exigido pela lei aplicável.',
          'Você pode encerrar sua conta usando as Configurações. Também podemos restringir uma conta em caso de violação destes Termos, risco de segurança ou obrigação legal, buscando agir de forma proporcional e informando você quando apropriado.',
        ],
      },
    ],
  },
  cookies: {
    id: 'cookies',
    eyebrow: 'Tecnologias no navegador',
    title: 'Política de Cookies',
    summary:
      'Explicamos quais tecnologias mantêm sua sessão, lembram suas escolhas e quais controles você tem.',
    sections: [
      {
        title: '1. Como usamos cookies e armazenamento local',
        paragraphs: [
          'Cookies e tecnologias semelhantes armazenam pequenas informações no seu navegador. O We Better também usa armazenamento local para manter sua sessão, idioma, tema, preferências e dados temporários necessários para uma experiência consistente.',
          'Essas tecnologias não são usadas para publicidade comportamental pelo código atual da aplicação.',
        ],
      },
      {
        title: '2. Categorias em uso',
        paragraphs: [
          'Abaixo estão as categorias que a aplicação utiliza ou pode utilizar conforme os recursos habilitados.',
        ],
        bullets: [
          'Estritamente necessários: autenticação, prevenção de fraude, segurança e manutenção da sessão. Não podem ser desativados sem impedir o funcionamento da conta.',
          'Preferências: idioma, tema e escolhas de interface. Você pode removê-las nas configurações do navegador; algumas preferências precisarão ser definidas novamente.',
          'Funcionais: permissões de notificações e inscrição de push, somente depois de sua ação explícita no navegador.',
          'Terceiros: Stripe, Supabase e Typebot podem usar suas próprias tecnologias quando você acessa recursos fornecidos por eles. Consulte os avisos desses provedores para detalhes.',
        ],
      },
      {
        title: '3. Seus controles',
        paragraphs: [
          'Você pode apagar ou bloquear cookies nas configurações do navegador e revogar permissões de notificação pelo sistema operacional ou pelo navegador. Bloquear tecnologias necessárias pode impedir login, checkout ou sincronização de preferências.',
          'Quando adicionarmos cookies não necessários que exijam consentimento, disponibilizaremos uma escolha prévia e um meio direto de alterar a decisão. Esta política será atualizada com a lista correspondente.',
        ],
      },
    ],
  },
  support: {
    id: 'support',
    eyebrow: 'Ajuda',
    title: 'Suporte We Better',
    summary: 'Caminhos simples para voltar à sua jornada quando algo não sair como esperado.',
    sections: [
      {
        title: 'Antes de entrar em contato',
        paragraphs: [
          'Para problemas de acesso, tente redefinir sua senha. Para assinatura, use Configurações > Plano e cobrança. Para seus dados, use Configurações > Conta para exportar ou excluir a conta.',
        ],
      },
      {
        title: 'Como pedir ajuda',
        paragraphs: [
          supportEmail
            ? `Envie uma mensagem para ${supportEmail} com o e-mail da conta, uma descrição do problema, o dispositivo/navegador e, se possível, uma captura de tela sem dados sensíveis. Nunca envie sua senha, código de autenticação ou dados de cartão.`
            : 'O e-mail de suporte ainda não foi configurado. Antes do lançamento público, o responsável deve definir VITE_SUPPORT_EMAIL com um canal monitorado e publicar esta página novamente.',
        ],
      },
      {
        title: 'Segurança e urgências',
        paragraphs: [
          'Se acreditar que sua conta foi comprometida, altere a senha imediatamente e entre em contato pelo canal de suporte quando ele estiver disponível.',
          'O suporte não substitui atendimento de emergência ou cuidado profissional. Em uma situação urgente, procure os serviços locais de emergência ou saúde.',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    eyebrow: 'Contato',
    title: 'Fale com o We Better',
    summary: 'Dúvidas sobre a plataforma, privacidade, cobrança ou parcerias começam aqui.',
    sections: [
      {
        title: 'Atendimento e privacidade',
        paragraphs: [
          supportEmail
            ? `Escreva para ${supportEmail}. Informe o assunto — suporte, cobrança, privacidade ou parceria — para que a solicitação seja direcionada corretamente.`
            : 'O contato público ainda não foi configurado. O lançamento depende da publicação de um e-mail de atendimento e de privacidade funcional.',
        ],
      },
      {
        title: 'O que incluir',
        paragraphs: [
          'Para contas e cobranças, use o e-mail cadastrado e não envie senhas, códigos de acesso, número completo de cartão ou outros dados sensíveis pelo e-mail.',
        ],
      },
    ],
  },
  dmca: {
    id: 'dmca',
    eyebrow: 'Direitos autorais',
    title: 'Aviso de Direitos Autorais',
    summary:
      'Como comunicar uma alegada violação de direitos autorais relacionada ao conteúdo do We Better.',
    sections: [
      {
        title: 'Como enviar uma notificação',
        paragraphs: [
          supportEmail
            ? `Envie sua notificação para ${supportEmail} com o assunto “Direitos autorais”. Inclua identificação da obra, URL ou localização precisa do material, seus dados de contato, declaração de boa-fé e declaração de que as informações são verdadeiras.`
            : 'O canal para avisos de direitos autorais ainda não foi configurado. O responsável deve definir VITE_SUPPORT_EMAIL antes de publicar esta página.',
          'Analisaremos notificações válidas conforme a legislação aplicável. Podemos solicitar informações adicionais, remover ou restringir acesso ao material enquanto avaliamos a alegação e comunicar a pessoa afetada quando apropriado.',
        ],
      },
      {
        title: 'Contranotificação',
        paragraphs: [
          'Se você acredita que material removido foi identificado por engano, responda pelo mesmo canal com a identificação do conteúdo, a justificativa, seus dados de contato e uma declaração de boa-fé. Não use este procedimento para disputas que não envolvam direitos autorais.',
        ],
      },
    ],
  },
  'legal-notice': {
    id: 'legal-notice',
    eyebrow: 'Informações legais',
    title: 'Aviso Legal',
    summary: 'Identificação, escopo e versão dos documentos públicos do We Better.',
    sections: [
      {
        title: 'Identificação',
        paragraphs: [
          `Serviço: We Better. Responsável informado no produto: We Better Ltd. Endereço público da plataforma: ${productUrl}.`,
        ],
      },
      {
        title: 'Documentos relacionados',
        paragraphs: [
          'Este aviso deve ser lido com os Termos de Serviço, o Aviso de Privacidade e a Política de Cookies. Em caso de conflito, prevalece a regra específica aplicável à matéria.',
        ],
      },
      {
        title: 'Versão e revisão',
        paragraphs: [
          `Versão: 1.0. Vigência: ${effectiveDate}. Próxima revisão programada: ${reviewDate}. Proprietário interno: responsável legal e de privacidade do We Better.`,
        ],
      },
    ],
  },
};

const documentByPath: Record<string, DocumentId> = {
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/cookies': 'cookies',
  '/support': 'support',
  '/contact': 'contact',
  '/dmca': 'dmca',
  '/legal-notice': 'legal-notice',
};

const LegalDocumentPage = (): JSX.Element => {
  const { pathname } = useLocation();
  const document = documents[documentByPath[pathname] ?? 'legal-notice'];

  return (
    <main className={styles.page}>
      <article className={styles.document}>
        <Link to="/" className={styles.backLink}>
          ← Voltar ao We Better
        </Link>
        <p className={styles.eyebrow}>{document.eyebrow}</p>
        <h1>{document.title}</h1>
        <p className={styles.summary}>{document.summary}</p>
        <p className={styles.metadata}>
          Vigente desde {effectiveDate} · Próxima revisão: {reviewDate}
        </p>

        {document.sections.map(section => (
          <section key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            {section.paragraphs.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {supportEmail && (
          <a className={styles.contactCta} href={`mailto:${supportEmail}`}>
            Escrever para {supportEmail}
          </a>
        )}
      </article>
    </main>
  );
};

export default LegalDocumentPage;
