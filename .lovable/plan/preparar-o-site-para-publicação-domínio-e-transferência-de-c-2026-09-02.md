# Preparar o site para publicação, domínio e transferência de conta

Decisões confirmadas: o site vai rodar na hospedagem da Lovable, com o domínio registrado na Hostinger apontado para ela. Da marca Lovable, saem os textos/links do README (código) e o badge "Edit with Lovable" (configuração, não código).

## Por que o teste na Vercel falhou

A tela "This page didn't load" é a página de erro do próprio app: o servidor caiu ao renderizar. Este projeto é compilado para o runtime de servidor da hospedagem da Lovable (Cloudflare Workers) e depende de variáveis de ambiente do backend que não existiam na Vercel — sem elas o cliente de banco/auth lança erro em toda requisição. Como a decisão é hospedar na Lovable, nenhuma correção de código é necessária para isso; o deploy da Vercel deve ser descartado (e o domínio gratuito removido lá, para não ficar servindo uma versão quebrada).

## O que será feito no código

1. **README limpo** — remover as seções e links "Built with Lovable" / "Continue developing in the Lovable editor" e o link do projeto, deixando uma documentação neutra do site (como rodar em desenvolvimento, como fazer build, estrutura de pastas).
2. **Metadados de produção** — revisar título, descrição e URL canônica das páginas para o domínio definitivo (hoje o canônico aponta para o domínio de preview). Assim que o domínio da Hostinger estiver conectado, o canônico e o `robots.txt`/sitemap passam a referenciar esse domínio.
3. **Sem remoção das integrações internas** — o login administrativo, o banco de imóveis, os leads, o upload de imagens e a página "Sobre" usam o backend gerenciado. Nada disso é tocado: remover essas integrações exigiria migrar banco e storage para uma conta própria, o que não é o objetivo agora.

## O que é feito fora do código (por você, na interface)

1. **Publicar** o projeto (botão Publish) para gerar a versão de produção.
2. **Esconder o badge "Edit with Lovable"** — é uma opção de configuração de publicação e requer plano Pro ou superior na conta que ficar dona do projeto. Faço isso a pedido depois que a transferência estiver concluída, para não ativar na conta errada.
3. **Transferir o projeto** para a outra conta Lovable antes de conectar o domínio, para que domínio e plano fiquem na conta definitiva.
4. **Conectar o domínio da Hostinger** em Configurações do projeto > Domínios, adicionando tanto o domínio raiz quanto o `www`, e escolhendo um deles como principal. Na Hostinger entram os registros DNS que a Lovable exibir (A para raiz e www, mais o TXT de verificação). O certificado HTTPS é emitido automaticamente; a propagação pode levar algumas horas.
5. **Republicar** após a troca de domínio, para que os metadados com o domínio novo entrem no ar.

## Ordem recomendada

```text
limpar README + metadados  ->  transferir projeto de conta
   ->  publicar  ->  conectar domínio (Lovable + DNS Hostinger)
   ->  atualizar canônico/robots para o domínio final  ->  republicar
   ->  esconder badge (plano Pro)  ->  remover deploy antigo da Vercel
```

## Detalhes técnicos

- Arquivos tocados: `README.md`, `src/routes/__root.tsx` (canônico/OG), `public/robots.txt` e o `head()` das rotas de conteúdo.
- Mantidos intactos: `src/integrations/**`, `src/lib/admin-gate.*`, `vite.config.ts` (o preset de build da hospedagem) e `.env` gerado.
- `src/lib/lovable-error-reporting.ts` permanece: ele só envia dados quando o app roda dentro do editor, não em produção.
- Nenhum arquivo de rewrite/redirect (`vercel.json`, `_redirects`) é necessário — as rotas profundas já funcionam na hospedagem da Lovable.
