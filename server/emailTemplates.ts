/** Templates HTML dos e-mails transacionais (Zoho Mail). */
import type { QuoteRequest, CommercialSettings } from '../src/types/index.js';

export function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderClientQuoteEmail(quote: QuoteRequest, settings: CommercialSettings): string {
  return `
    <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06152B 0%, #0866FF 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">WortSite Studio</h1>
          <p style="margin: 6px 0 0; color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Confirmação de Solicitação de Orçamento</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #FFFFFF; margin-top: 0;">Olá, <strong>${escapeHtml(quote.name)}</strong>!</p>
          <p style="font-size: 14px; color: #B8C1D1; line-height: 1.6;">Recebemos com sucesso sua solicitação de orçamento. Nossa equipe de especialistas já está avaliando o escopo para estruturar uma proposta personalizada com os mais altos padrões de design e engenharia web.</p>
          
          <!-- Protocol Card -->
          <div style="background-color: #05070D; border: 1px solid #171D2B; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #1E293B;">
              <span style="font-size: 11px; text-transform: uppercase; color: #B8C1D1; letter-spacing: 0.5px; display: block;">Protocolo de Atendimento</span>
              <span style="font-size: 20px; font-weight: bold; color: #00CFFF; font-family: 'Courier New', Courier, monospace;">${quote.protocol}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #FFFFFF; font-size: 13px;">Tipo de Projeto:</strong>
              <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.projectType.replace(/_/g, ' '))}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #FFFFFF; font-size: 13px;">Segmento / Ramo:</strong>
              <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.businessSegment)}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #FFFFFF; font-size: 13px;">Expectativa de Prazo:</strong>
              <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.timeline)}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #FFFFFF; font-size: 13px;">Faixa Estimada de Investimento:</strong>
              <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.budgetRange)}</span>
            </div>
            ${quote.description ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #1E293B;">
              <strong style="color: #FFFFFF; font-size: 13px; display: block; margin-bottom: 4px;">Informações Adicionais:</strong>
              <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(quote.description)}</p>
            </div>` : ''}
          </div>

          <!-- Next steps -->
          <div style="background: rgba(8, 102, 255, 0.08); border-left: 3px solid #0866FF; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">Próximas Etapas</p>
            <p style="margin: 6px 0 0; font-size: 13px; color: #B8C1D1; line-height: 1.5;">
              Nossa equipe entrará em contato em breve via WhatsApp <strong>${escapeHtml(quote.whatsapp)}</strong> ou por este e-mail para validar detalhes técnicos e apresentar sua proposta comercial.
            </p>
          </div>

          <p style="font-size: 13px; color: #B8C1D1; margin-bottom: 0;">Fique à vontade para responder a esta mensagem caso deseje anexar referências ou solicitar ajustes.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #06152B; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
          <p style="margin: 0; font-size: 12px; color: #FFFFFF; font-weight: 600;">WortSite Studio • Tecnologia e Soluções Digitais</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #B8C1D1;">Atendimento: ${escapeHtml(settings.businessHours || 'Segunda a Sexta, das 09h às 18h')} | ${escapeHtml(settings.contactEmail || 'contato@wortsite.com.br')}</p>
        </div>
      </div>
    </div>
  `;
}

export function renderAdminLeadNotificationEmail(quote: QuoteRequest, settings: CommercialSettings): string {
  const cleanPhone = quote.whatsapp.replace(/\D/g, '');
  const waText = encodeURIComponent(`Olá, ${quote.name}! Sou da equipe WortSite. Recebemos sua solicitação de orçamento (Protocolo: ${quote.protocol}) e gostaríamos de apresentar os detalhes para o seu projeto!`);
  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

  return `
    <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #0866FF; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: #0866FF; padding: 24px; text-align: center;">
          <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; color: #FFFFFF; margin-bottom: 8px;">NOVO LEAD RECEBIDO</span>
          <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold;">Solicitação de Orçamento</h2>
          <p style="margin: 4px 0 0; color: #00CFFF; font-size: 14px; font-family: monospace; font-weight: bold;">Protocolo: ${quote.protocol}</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Identificação do Cliente</h3>
            <div style="background-color: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 16px;">
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Nome:</strong> <span style="color: #FFFFFF;">${escapeHtml(quote.name)}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">E-mail:</strong> <a href="mailto:${escapeHtml(quote.email)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(quote.email)}</a></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">WhatsApp:</strong> <span style="color: #10B981; font-weight: bold;">${escapeHtml(quote.whatsapp)}</span></p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Especificações do Projeto</h3>
            <div style="background-color: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 16px;">
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Tipo de Projeto:</strong> <span style="color: #B8C1D1; text-transform: capitalize;">${escapeHtml(quote.projectType.replace(/_/g, ' '))}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Segmento de Atuação:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.businessSegment)}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Investimento Previsto:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.budgetRange)}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Prazo Estimado:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.timeline)}</span></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Data de Recebimento:</strong> <span style="color: #B8C1D1;">${new Date(quote.createdAt).toLocaleString('pt-BR')}</span></p>
            </div>
          </div>

          ${quote.description ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">Descrição do Cliente</h3>
            <div style="background: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 14px;">
              <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(quote.description)}</p>
            </div>
          </div>` : ''}

          <!-- Direct WhatsApp CTA -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="${waUrl}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              Iniciar Atendimento no WhatsApp
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #06152B; padding: 16px 24px; text-align: center; border-top: 1px solid #1E293B;">
          <p style="margin: 0; font-size: 11px; color: #B8C1D1;">Notificação automática gerada pelo sistema WortSite</p>
        </div>
      </div>
    </div>
  `;
}

export function renderStatusUpdateEmail(quote: QuoteRequest, newStatus: string, adminNotes?: string): string {
  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    pendente: {
      label: 'Pendente',
      color: '#F59E0B',
      desc: 'Sua solicitação de orçamento está em nossa fila de atendimento e será distribuída para um consultor técnico.'
    },
    em_analise: {
      label: 'Em Análise',
      color: '#00CFFF',
      desc: 'Nossa equipe de especialistas está avaliando o escopo técnico, viabilidade de arquitetura e prazos do seu projeto.'
    },
    proposta_enviada: {
      label: 'Proposta Enviada',
      color: '#0866FF',
      desc: 'Sua proposta comercial completa foi gerada! Entramos em contato via WhatsApp e e-mail com os detalhes da contratação.'
    },
    concluido: {
      label: 'Conclusão',
      color: '#10B981',
      desc: 'Parabéns! O processo de orçamento e alinhamento foi concluído com sucesso. Seja bem-vindo à WortSite!'
    }
  };

  const current = statusMap[newStatus] || { label: newStatus, color: '#0866FF', desc: 'O status do seu orçamento foi atualizado.' };

  return `
    <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: #06152B; border-bottom: 1px solid #1E293B; padding: 28px 24px; text-align: center;">
          <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold;">Atualização do seu Orçamento</h2>
          <p style="margin: 4px 0 0; color: #00CFFF; font-size: 14px; font-family: monospace;">Protocolo: ${quote.protocol}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #FFFFFF; margin-top: 0;">Olá, <strong>${escapeHtml(quote.name)}</strong>!</p>
          <p style="font-size: 14px; color: #B8C1D1;">O andamento da sua solicitação de orçamento registrou uma nova atualização:</p>

          <!-- Status Card -->
          <div style="background-color: #05070D; border: 1px solid #171D2B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #B8C1D1; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Novo Status</span>
            <span style="display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: bold; background: ${current.color}22; color: ${current.color}; border: 1px solid ${current.color}55;">
              ${current.label}
            </span>
            <p style="font-size: 13px; color: #B8C1D1; margin: 14px 0 0; line-height: 1.5;">${current.desc}</p>
          </div>

          ${adminNotes ? `
          <div style="background: rgba(8, 102, 255, 0.08); border-left: 3px solid #0866FF; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <strong style="color: #FFFFFF; font-size: 13px; display: block; margin-bottom: 4px;">Mensagem da nossa equipe:</strong>
            <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(adminNotes)}</p>
          </div>` : ''}

          <p style="font-size: 13px; color: #B8C1D1; margin-bottom: 0;">Estamos permanentemente à disposição no WhatsApp ou respondendo a este e-mail.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #06152B; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
          <p style="margin: 0; font-size: 12px; color: #FFFFFF; font-weight: 600;">WortSite Studio • Desenvolvimento Web</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #B8C1D1;">www.wortsite.com.br</p>
        </div>
      </div>
    </div>
  `;
}
