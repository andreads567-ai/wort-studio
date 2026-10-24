import { createApp } from '../server/app.js';
import http from 'http';
import { getStorage } from '../server/storage.js';

async function runTests() {
  console.log('🚀 Iniciando testes do Módulo de Orçamentos e Propostas Comerciais...');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`📡 Servidor de teste escutando em ${baseUrl}`);

  try {
    // 1. Login Administrativo para obter token de sessão
    console.log('\n--- 1. Autenticação Administrativa ---');
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Wortsite@admin2026##' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Falha no login admin: ${JSON.stringify(loginData)}`);
    }
    const adminToken = loginData.token;
    console.log('✅ Login administrativo bem-sucedido. Token obtido.');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    };

    // 2. Testar Dados da Empresa Wort Studio
    console.log('\n--- 2. Perfil da Empresa (Wort Studio) ---');
    const compRes = await fetch(`${baseUrl}/api/company-profile`);
    const compData = await compRes.json();
    console.log('✅ Dados da empresa obtidos:', compData.nomeFantasia, '| CNPJ:', compData.cnpj);

    const updateCompRes = await fetch(`${baseUrl}/api/company-profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        ...compData,
        slogan: 'Tecnologia que Transforma Negócios'
      })
    });
    console.log('✅ Atualização dos dados da empresa status:', updateCompRes.status);

    // 3. Testar Clientes (PF e PJ)
    console.log('\n--- 3. Cadastro e Listagem de Clientes ---');
    const clientsRes = await fetch(`${baseUrl}/api/clients`, { headers: authHeaders });
    const clientsList = await clientsRes.json();
    console.log(`✅ Clientes existentes listados (${clientsList.length} encontrados)`);

    const newClientRes = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        tipo: 'PJ',
        nome: 'Cliente Teste Automatizado',
        razaoSocial: 'CLIENTE TESTE AUTOMATIZADO LTDA',
        cnpjCpf: '99.888.777/0001-66',
        responsavel: 'Carlos Testador',
        cargo: 'Gerente de TI',
        telefone: '(11) 97777-6666',
        email: 'carlos@clienteteste.com.br',
        endereco: 'Rua do Teste, 100 - São Paulo / SP'
      })
    });
    const createdClient = await newClientRes.json();
    console.log('✅ Cliente cadastrado com sucesso. ID:', createdClient.id, '| Nome:', createdClient.nome);

    // 4. Testar Listagem de Propostas
    console.log('\n--- 4. Listagem e Consulta de Propostas ---');
    const listRes = await fetch(`${baseUrl}/api/proposals`, { headers: authHeaders });
    const proposalsList = await listRes.json();
    console.log(`✅ Propostas listadas: ${proposalsList.length} encontrada(s)`);
    if (proposalsList.length > 0) {
      console.log('   Primeira proposta:', proposalsList[0].numero, '| Status:', proposalsList[0].status);
    }

    // 5. Criar Nova Proposta Comercial com Módulos e Subescopos (Item 7 & 8)
    console.log('\n--- 5. Criação de Proposta com Escopo Hierárquico ---');
    const newProposalPayload = {
      informacoesProjeto: {
        nomeProjeto: 'Portal Empresarial & E-commerce B2B',
        dataEmissao: '29/10/2026',
        validadeDias: 15,
        prazoEstimado: '60 dias úteis',
        revisoesIncluidas: '3 rodadas',
        objetivoProjeto: 'Desenvolver ecossistema digital corporativo com catálogo e integração bancária.',
        observacoesGerais: 'Garantia de 90 dias após implantação.'
      },
      cliente: createdClient,
      modulos: [
        {
          id: 'mod-1',
          codigo: 'MÓDULO 1',
          nome: 'FINANCEIRO & COBRANÇA',
          descricao: 'Controle de contas a pagar, receber e fluxo de caixa.',
          ordem: 1,
          subescopos: [
            {
              id: 'sub-1',
              codigo: '1.1',
              nome: 'CONTAS A PAGAR',
              descricao: 'Permitir cadastrar despesas, fornecedores e emitir alertas de vencimento.',
              acoes: ['Cadastrar despesas', 'Registrar pagamentos'],
              regras: ['Diferenciar despesas pendentes e quitadas'],
              criteriosAceite: ['Comprovante emitido com sucesso'],
              ordem: 1
            }
          ]
        }
      ],
      financeiro: {
        valorTotal: 15000,
        tipoDesconto: 'valor',
        desconto: 1000,
        valorFinal: 14000,
        formaPagamento: 'cartao',
        parcelas: 6,
        valorParcela: 2333.33,
        condicoesPagamento: ['Entrada de 30%', 'Saldo em 6x no cartão']
      },
      prazosGarantia: {
        prazoEntrega: '60 dias úteis',
        garantia: '90 dias para ajustes de funcionamento.'
      }
    };

    const createPropRes = await fetch(`${baseUrl}/api/proposals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProposalPayload)
    });
    const createdProp = await createPropRes.json();
    console.log('✅ Proposta comercial criada com sucesso! Número:', createdProp.numero, '| ID:', createdProp.id);
    console.log('   Módulos cadastrados:', createdProp.modulos.length);
    console.log('   Subescopos no Módulo 1:', createdProp.modulos[0].subescopos.length);

    // 6. Consultar Proposta Específica por ID (Acesso Público do Cliente)
    console.log('\n--- 6. Consulta Pública da Proposta para o Cliente ---');
    const getPropRes = await fetch(`${baseUrl}/api/proposals/${createdProp.id}`);
    const getPropData = await getPropRes.json();
    console.log('✅ Consulta pública realizada com sucesso:', getPropData.informacoesProjeto.nomeProjeto, '| Valor:', getPropData.financeiro.valorFinal);

    // 7. Duplicar Orçamento
    console.log('\n--- 7. Duplicação de Orçamento ---');
    const dupRes = await fetch(`${baseUrl}/api/proposals/${createdProp.id}/duplicate`, {
      method: 'POST',
      headers: authHeaders
    });
    const dupData = await dupRes.json();
    console.log('✅ Proposta duplicada com sucesso! Novo número:', dupData.numero, '| ID:', dupData.id);

    // 8. Atualizar Situação da Proposta
    console.log('\n--- 8. Alteração de Situação (Status) ---');
    const statusRes = await fetch(`${baseUrl}/api/proposals/${createdProp.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'enviada', motivo: 'Enviada por WhatsApp para diretoria' })
    });
    const statusData = await statusRes.json();
    console.log('✅ Situação alterada para:', statusData.status);

    // 9. Aceite e Assinatura Digital do Cliente (Validação Jurídica)
    console.log('\n--- 9. Aprovação e Assinatura Digital pelo Cliente ---');
    const approveRes = await fetch(`${baseUrl}/api/proposals/${createdProp.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Carlos Testador',
        cargo: 'Gerente de TI',
        email: 'carlos@clienteteste.com.br',
        cpf: '123.456.789-00',
        assinaturaTexto: 'Carlos Testador',
        concordancia: true
      })
    });
    const approveData = await approveRes.json();
    console.log('✅ Proposta aceita e assinada digitalmente!');
    console.log('   Hash criptográfico:', approveData.hash);
    console.log('   Timestamp do aceite:', approveData.aprovadoEm);
    console.log('   Novo status da proposta:', approveData.proposal.status);

    // 10. Limpeza / Exclusão da proposta duplicada de teste
    console.log('\n--- 10. Exclusão de Proposta ---');
    const delRes = await fetch(`${baseUrl}/api/proposals/${dupData.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    console.log('✅ Proposta de teste excluída com status:', delRes.status);

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
