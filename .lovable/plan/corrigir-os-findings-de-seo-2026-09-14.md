# Corrigir os findings de SEO

## Resultado
- Adicionar dados estruturados de navegação às páginas individuais dos imóveis.
- Criar um sitemap em `/sitemap.xml` com todas as páginas públicas e imóveis cadastrados.
- Referenciar o sitemap no `robots.txt` e manter `/admin` e `/auth` fora da indexação.
- Completar os metadados sociais obrigatórios das páginas públicas durante a mesma revisão.

## Implementação
- Gerar `BreadcrumbList` em JSON-LD na página do imóvel com Início, categoria e título, usando URLs canônicas do domínio publicado.
- Instalar o gerador de sitemap baseado nas rotas do site, com decisão explícita para cada página.
- Buscar todos os imóveis públicos em lotes para incluir as URLs dinâmicas, sem datas artificiais de atualização.
- Marcar páginas internas e endpoints como excluídos do sitemap.
- Validar o XML, a compilação e a resposta das páginas no preview.
- Registrar os dois findings como corrigidos e indicar uma nova verificação no painel de SEO.
