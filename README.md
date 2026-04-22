# Portfolio Dev

Template de portfólio pensado para quem quer baixar, trocar seus dados e publicar sem precisar entender o projeto inteiro.

Se você for leigo, pode tratar assim:

- quer trocar nome, bio e contatos: edite `src/lib/site-profile.ts`
- quer trocar projetos, posts e habilidades sem Supabase: edite `src/lib/storage.ts`
- quer usar banco real: configure `.env` e rode `supabase/setup.sql`

## Precisa de ajuda?

Se você quiser me contratar para:

- subir este portfólio
- trocar os textos
- conectar com Supabase
- ajustar imagens
- personalizar o projeto para o seu perfil

Fale comigo em:
- WhatsApp: [Entrar em contato](https://wa.me/5541997609480?text=Entrei%20em%20contato%20pois%20quero%20uma%20consultoria%20sobre%20o%20template%20gr%C3%A1tis%20fornecido%20no%20GitHub.)
- Email: `brunouaslidev@gmail.com`
- GitHub: `https://github.com/brunouasli-dev`

Troque esses dados pelos seus contatos reais antes de publicar o repositório.

## Aviso importante

Todos os dados, nomes, imagens, textos, projetos e posts que vêm neste projeto são **fakes** e usados apenas como exemplo.

Parte das imagens e do conteúdo foi gerada com ajuda de **IA** para deixar o template mais divertido e mais fácil de visualizar.

Antes de publicar, o ideal é trocar:

- nome
- email
- links
- bio
- projetos
- posts
- habilidades
- imagens
- currículo

## Arquivos principais

Os arquivos mais importantes para edição são:

- `src/lib/site-profile.ts`
- `src/lib/storage.ts`
- `src/lib/client.ts`
- `src/lib/content-store.ts`
- `src/lib/media-storage.ts`
- `.env.example`
- `supabase/setup.sql`

## Como rodar o projeto

1. Instale as dependências:

```bash
npm install
```

2. Rode o projeto:

```bash
npm run dev
```

3. Abra no navegador:

```txt
http://localhost:5173
```

## Rotas principais

- site público: `http://localhost:5173`
- login: `http://localhost:5173/login`
- admin: `http://localhost:5173/admin`
- projetos: `http://localhost:5173/projetos`
- habilidades: `http://localhost:5173/habilidades`
- blog: `http://localhost:5173/blog`

## O que editar primeiro

Se você quer só personalizar o portfólio, comece por:

- `src/lib/site-profile.ts`

Se você não vai usar Supabase e quer mudar os conteúdos de exemplo, edite:

- `src/lib/storage.ts`

## Como trocar nome, bio, contatos e textos

Abra:

- `src/lib/site-profile.ts`

Ali ficam dados como:

- nome
- nome curto
- cargo
- frase de destaque
- email
- WhatsApp
- LinkedIn
- localização
- currículo
- imagem principal
- imagem de destaque

Também é nesse arquivo que você troca os textos da home, da seção sobre e dos blocos institucionais.

Exemplo simples:

```ts
export const siteProfile = {
  fullName: 'Seu Nome',
  shortName: 'Seu Nome',
  role: 'Seu cargo',
  roleHighlight: 'Seu destaque',
  email: 'contato@seudominio.com',
  linkedinUrl: 'https://www.linkedin.com/in/seu-perfil',
  whatsappUrl: 'https://wa.me/5500000000000',
}
```

## Como trocar projetos, posts e habilidades sem Supabase

Se você não configurar Supabase, o projeto usa os dados locais de:

- `src/lib/storage.ts`

Os principais blocos são:

- `createSampleProjects()`
- `createSampleBlogPosts()`
- `createSampleStacks()`

### Projeto local

Exemplo:

```ts
{
  id: crypto.randomUUID(),
  title: 'Nome do projeto',
  summary: 'Resumo do projeto',
  stack: 'React, TypeScript, Node.js',
  url: '',
  imageUrl: '/minha-imagem.png',
  imageAlt: 'Descrição da imagem do projeto',
  likes: 10,
  views: 100,
  shares: 5,
  published: true,
  updatedAt: daysAgo(1),
}
```

Campos importantes:

- `title`: nome do projeto
- `summary`: descrição do card e da página
- `stack`: tecnologias
- `url`: link do projeto
- `imageUrl`: imagem da capa
- `imageAlt`: texto alternativo da imagem
- `published`: mostra ou esconde o item

Se `url` estiver vazio, o botão abre o popup de `link indisponível`.

### Post local

Exemplo:

```ts
{
  id: crypto.randomUUID(),
  title: 'Título do post',
  excerpt: 'Resumo curto',
  content: 'Texto completo',
  category: 'Frontend',
  imageUrl: '/post-exemplo.png',
  imageAlt: 'Descrição da imagem do post',
  likes: 10,
  views: 100,
  shares: 5,
  published: true,
  updatedAt: daysAgo(1),
}
```

### Habilidade local

Exemplo:

```ts
{
  id: crypto.randomUUID(),
  name: 'React',
  link: 'https://react.dev',
  imageUrl: 'https://placehold.co/600x400?text=React',
  imageAlt: 'Placeholder com o nome React.',
  updatedAt: daysAgo(1),
}
```

Se `imageUrl` ficar vazio, a interface mostra um placeholder visual de `Sem imagem`.

## O que é `imageAlt`

`imageAlt` é o texto alternativo da imagem. Ele é usado para acessibilidade e também ajuda quando a imagem não carrega.

Hoje ele existe em:

- projetos
- posts
- habilidades

Se você usa modo local, preencha isso em:

- `src/lib/storage.ts`

Se você usa Supabase, preencha isso no admin:

- `/admin/projetos`
- `/admin/blog`
- `/admin/habilidades`

## Como acessar o login

A página de login fica em:

```txt
http://localhost:5173/login
```

Depois do login, o admin fica em:

```txt
http://localhost:5173/admin
```

## Como trocar o email e a senha do modo local

Se você **não** estiver usando Supabase, o projeto usa um login local de exemplo em:

- `src/lib/client.ts`

Procure por:

```ts
const validUser = 'pinguim-eletrico@gmail.com'
const validPass = 'pinguim-trovoada'
```

Troque pelos dados que quiser.

Exemplo:

```ts
const validUser = 'meuemail@exemplo.com'
const validPass = 'minhasenha123'
```

## Diferença entre modo local e modo Supabase

### Sem Supabase

Se você não configurar as variáveis do `.env`, o projeto:

- usa login local
- usa os dados do `src/lib/storage.ts`
- salva localmente no navegador

### Com Supabase

Se você configurar o Supabase corretamente, o projeto:

- usa autenticação real do Supabase
- usa dados reais do banco
- para de usar os dados do `src/lib/storage.ts` para conteúdo

Ou seja:

- `storage.ts` é para exemplo e modo local
- Supabase é para uso real

## Como configurar o `.env`

Copie o `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Depois reinicie o projeto:

```bash
npm run dev
```

## Setup do Supabase

Se você for usar Supabase, precisa rodar o arquivo:

- `supabase/setup.sql`

Esse arquivo já cria:

- tabela `projects`
- tabela `blog_posts`
- tabela `stacks`
- coluna `image_alt`
- funções RPC de métricas
- bucket `assets`
- policies de storage

### Como rodar

1. Abra o painel do Supabase.
2. Vá em `SQL Editor`.
3. Abra o arquivo `supabase/setup.sql`.
4. Copie todo o conteúdo.
5. Cole no editor do Supabase.
6. Execute.

Se você configurar o `.env` mas **não** rodar esse SQL, o projeto pode quebrar com erros de:

- tabela não encontrada
- coluna `image_alt` não encontrada
- função RPC não encontrada
- bucket não encontrado
- policy de upload bloqueando envio

## Primeiro usuário no Supabase

Este projeto não deixa cadastro público aberto para qualquer pessoa.

Isso foi feito de propósito para evitar que usuários leigos publiquem o site com signup liberado e acabem deixando estranhos entrarem no admin.

Por isso, o primeiro acesso deve ser criado manualmente no Supabase:

1. Abra o painel do Supabase.
2. Vá em `Authentication`.
3. Vá em `Users`.
4. Clique em `Add user`.
5. Crie o email e a senha.

Depois faça login em:

```txt
http://localhost:5173/login
```

## Upload de imagens no Supabase

O projeto usa o bucket:

- `assets`

As imagens são organizadas em pastas como:

- `projects/`
- `blog/`
- `stacks/`

O projeto tenta criar o bucket automaticamente se ele não existir, mas o ideal continua sendo rodar o `supabase/setup.sql`, porque é ele que já cria o bucket e as permissões certas.

## Como trocar imagens

As imagens do projeto ficam normalmente na pasta:

- `public/`

Exemplos:

- `public/profile-placeholder.svg`
- `public/experience-placeholder.svg`
- `public/pinguin-em-fuga-no-escritorio.png`

Para usar sua própria imagem:

1. coloque o arquivo dentro de `public/`
2. use o caminho começando com `/`

Exemplo:

```ts
profileImagePath: '/minha-foto.png'
```

## Como trocar a imagem do popup de link indisponível

Quando um projeto está sem link, o site abre um popup com uma imagem.

Hoje esse popup usa um arquivo em:

- `public/pinguin-em-fuga-no-escritorio.png`

Se quiser trocar:

1. coloque a nova imagem em `public/`
2. edite o componente:

- `src/components/ProjectLinkDialog.tsx`

Exemplo:

```ts
imageSrc="/pinguin-em-fuga-no-escritorio.png"
```

## Como trocar o currículo

O currículo é definido no `site-profile.ts` pela propriedade:

- `resumePath`

Exemplo:

```ts
resumePath: '/meu-curriculo.pdf'
```

Se quiser usar PDF:

1. coloque o arquivo em `public/`
2. troque o valor de `resumePath`

## Fallbacks visuais

O projeto já tem alguns comportamentos de fallback:

- se uma lista vier vazia na home, aparece um texto em vez do carrossel vazio
- se uma habilidade estiver sem imagem, aparece um placeholder de `Sem imagem`
- se um projeto estiver sem URL, aparece o popup de `link indisponível`
- se a imagem não tiver `imageAlt`, o projeto usa o título ou o nome do item como fallback

## Dica sobre cache

Se você mudou algum conteúdo e ele não apareceu:

1. feche a aba
2. abra de novo
3. faça um hard refresh
4. se necessário, limpe o `localStorage`

Isso pode acontecer principalmente quando você alterna entre modo local e modo Supabase.

## Problemas comuns

### Configurei Supabase e ainda aparece conteúdo do exemplo

Confira:

- o `.env` está no projeto certo
- você usou `VITE_SUPABASE_PUBLISHABLE_KEY`
- reiniciou o `npm run dev`
- rodou o `supabase/setup.sql`

### Não consigo salvar no Supabase

Na maioria das vezes é porque faltou rodar:

- `supabase/setup.sql`

Ele já cria as tabelas, colunas, funções RPC, bucket `assets` e policies.

### Mudei `storage.ts` e não refletiu no navegador

Limpe o cache local do site e recarregue a página.

## Publicação

Antes de publicar:

- troque os dados fake
- troque imagens
- revise links
- revise o `.env`

Para publicar no GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

## Atenção

Nunca publique:

- `.env`
- tokens
- chaves privadas
- senhas

Se por engano você subir o `.env`, trate as chaves como vazadas e troque tudo no serviço correspondente.
