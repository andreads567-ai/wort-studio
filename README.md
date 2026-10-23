# Wort Studio

Site institucional da **Wort Studio** (criação de sites, landing pages e páginas de vendas) com painel administrativo, catálogo de modelos, planos e formulário de orçamento com envio de e-mails via **Zoho Mail**.

## Tecnologias

- **Frontend:** React 19, Vite, Tailwind CSS 4, Motion, Lucide Icons
- **Backend:** Node.js + Express (`server.ts`), Nodemailer / Zoho Mail API
- **Banco de dados:** arquivo JSON local (`data/database.json`, criado automaticamente)

## Estrutura

```
├── public/              # Arquivos estáticos (favicon, logos)
├── src/
│   ├── assets/          # Imagens importadas pelos componentes
│   ├── components/      # Componentes React reutilizáveis
│   ├── data/            # Dados iniciais (modelos, planos, serviços, configurações)
│   ├── pages/           # Páginas do site e painel admin
│   ├── services/        # Cliente da API
│   ├── types/           # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts            # Servidor Express (API + Vite em dev / dist em produção)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── .env.example         # Modelo das variáveis de ambiente
```

## Rodando localmente

**Pré-requisito:** Node.js 20 ou superior.

```bash
npm install
cp .env.example .env      # no Windows: copy .env.example .env
# edite o .env e preencha ADMIN_PASSWORD e as credenciais do Zoho
npm run dev
```

Acesse <http://localhost:3000>.

## Produção

```bash
npm install
npm run build
# Linux/macOS
NODE_ENV=production npm start
# Windows (PowerShell)
$env:NODE_ENV="production"; npm start
```

Em produção o servidor entrega a pasta `dist/` gerada pelo build. Configure as variáveis do `.env.example` no painel da hospedagem (Render, Railway, Cloud Run, VPS etc.).

> **Observação:** o projeto possui backend (Express). O GitHub armazena o código, mas o **GitHub Pages** hospeda apenas sites estáticos — para o formulário de orçamento, painel admin e envio de e-mails funcionarem, publique em um serviço que rode Node.js.

## Scripts

| Comando         | Descrição                                   |
|-----------------|---------------------------------------------|
| `npm run dev`   | Servidor de desenvolvimento (porta 3000)    |
| `npm run build` | Gera o build de produção em `dist/`         |
| `npm start`     | Inicia o servidor                           |
| `npm run lint`  | Verificação de tipos com TypeScript         |
| `npm run clean` | Remove a pasta `dist/`                      |

## Segurança

- O arquivo `.env` e a pasta `data/` (leads e credenciais salvas pelo painel) **não** são enviados ao GitHub (`.gitignore`).
- Nunca coloque senhas ou tokens diretamente no código.
