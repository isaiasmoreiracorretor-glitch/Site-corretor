# Isaías Imóveis

Site de divulgação de imóveis em Salvador e região (lançamentos, na planta, prontos para morar e usados), com contato direto pelo WhatsApp, captura de leads e área administrativa para o corretor.

## Stack

- React 19 + TypeScript
- TanStack Start / TanStack Router (rotas em `src/routes`)
- Tailwind CSS v4 (`src/styles.css`)
- Banco de dados, autenticação e storage gerenciados no backend do projeto

## Desenvolvimento

Requisitos: Node.js 20+ e npm.

```sh
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run lint     # análise estática
```

## Estrutura

```text
src/
  routes/        páginas e endpoints (roteamento por arquivos)
  components/    componentes de site, admin e UI
  lib/           APIs, funções de servidor e utilitários
  config/site.ts dados do corretor (nome, WhatsApp, CRECI, áreas)
  data/          catálogos auxiliares (bairros, tipos, filtros)
public/          arquivos estáticos (favicon, robots.txt, logos)
```

## Configuração do corretor

Nome, marca, CRECI, WhatsApp, e-mail e áreas atendidas ficam centralizados em `src/config/site.ts`.

## Área administrativa

Acesso restrito em `/auth`, painel em `/admin`: cadastro/edição/exclusão de imóveis, upload de imagens, leads recebidos e edição da página "Sobre".
