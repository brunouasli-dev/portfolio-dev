# Portfolio Dev

Template de portfólio para quem quer publicar um site pessoal com visual pronto e edição simples.

Este projeto foi pensado para pessoas leigas. Se você não sabe programar muito, tudo bem: na maior parte dos casos você só vai abrir alguns arquivos, trocar textos, salvar e pronto.

## Aviso importante

Todos os dados, textos, nomes, projetos, posts e exemplos usados neste portfólio são **fictícios** e existem apenas para demonstrar como o template funciona.

As imagens, cenários e parte do conteúdo foram gerados com ajuda de **IA**, apenas para deixar o projeto mais divertido, visual e fácil de entender para quem baixar o template.

Antes de publicar seu portfólio, o ideal é trocar:

- nome
- email
- links
- textos
- projetos
- posts
- imagens

## Antes de começar

Você vai mexer principalmente nestes arquivos:

- `src/lib/site-profile.ts`
- `src/lib/storage.ts`
- `.env` ou `.env.example`

## O que editar primeiro

Se você quer só trocar nome, textos e contatos, comece por:

- `src/lib/site-profile.ts`

Se você quer trocar projetos, posts e habilidades quando não estiver usando Supabase, edite:

- `src/lib/storage.ts`

## Como rodar o projeto

1. Instale as dependências:

```bash
npm install
```

2. Rode o projeto:

```bash
npm run dev
```

3. Abra no navegador o endereço mostrado no terminal. Normalmente:

```txt
http://localhost:5173
```

## Como acessar a área de login

A tela de login fica em:

```txt
http://localhost:5173/login
```

Depois de entrar, a área administrativa fica em:

```txt
http://localhost:5173/admin
```

## Como trocar o email e a senha do modo local

Se você **não** estiver usando Supabase, o projeto usa um login local de exemplo.

Esse login fica no arquivo:

- `src/lib/client.ts`

Procure por este trecho:

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

Depois salve o arquivo e reinicie o projeto se necessário.

## Importante sobre o modo local

O login local existe só para facilitar testes em projetos sem Supabase.

Se o Supabase **não** estiver configurado, o projeto:

- usa o login local
- usa os dados do arquivo `src/lib/storage.ts`

Se o Supabase estiver configurado corretamente, o projeto tenta usar:

- autenticação real do Supabase
- dados vindos do banco

## Como trocar seu nome, textos e contatos

Abra o arquivo:

- `src/lib/site-profile.ts`

Lá você verá algo assim:

```ts
export const siteProfile = {
  fullName: 'Pinguim Elétrico',
  shortName: 'Pinguim',
  role: 'desenvolvedor júnior',
  roleHighlight: 'interfaces web',
  brandTagline: 'curioso, elétrico e em evolução constante',
  email: 'contato@example.com',
  linkedinUrl: 'https://www.linkedin.com/in/seu-perfil',
  whatsappUrl: 'https://wa.me/5500000000000',
}
```

Troque os valores entre aspas pelos seus dados.

### Campos mais importantes

- `fullName`: seu nome principal
- `shortName`: nome curto
- `role`: seu cargo
- `roleHighlight`: complemento do cargo
- `brandTagline`: frase curta da sua marca
- `location`: sua cidade, estado ou país
- `yearsOfExperience`: tempo de experiência
- `email`: seu email
- `linkedinUrl`: seu LinkedIn
- `whatsappUrl`: seu WhatsApp
- `resumePath`: caminho do currículo
- `profileImagePath`: foto principal
- `showcaseImagePath`: imagem usada em destaque

### Textos das seções

No mesmo arquivo você também edita:

- `contactCta`: texto da seção de contato
- `heroDescription`: texto principal da home
- `aboutTitle`: título da seção “sobre”
- `aboutParagraphs`: parágrafos da seção “sobre”
- `capabilityIntro`: texto de introdução das habilidades
- `capabilities`: lista de blocos com título e descrição

Exemplo:

```ts
aboutParagraphs: [
  'Texto 1.',
  'Texto 2.',
  'Texto 3.',
]
```

Cada linha entre aspas vira um parágrafo no site.

## Como trocar os projetos, posts e habilidades sem Supabase

Se você não for usar Supabase, o site usa os dados locais do arquivo:

- `src/lib/storage.ts`

Os blocos principais são:

- `createSampleProjects()`
- `createSampleBlogPosts()`
- `createSampleStacks()`

### Como trocar projetos

Procure por:

```ts
function createSampleProjects(): ProjectItem[] {
```

Cada projeto tem este formato:

```ts
{
  id: crypto.randomUUID(),
  title: 'Nome do projeto',
  summary: 'Descrição do projeto',
  stack: 'React, TypeScript, Node.js',
  url: '',
  imageUrl: '/nome-da-imagem.png',
  likes: 10,
  views: 100,
  shares: 5,
  published: true,
  updatedAt: daysAgo(1),
}
```

O que cada campo faz:

- `title`: nome do projeto
- `summary`: descrição do projeto
- `stack`: tecnologias do projeto
- `url`: link do projeto
- `imageUrl`: imagem da capa
- `likes`, `views`, `shares`: números iniciais
- `published`: `true` para mostrar, `false` para esconder

Se você deixar `url: ''`, o botão de projeto pode mostrar o aviso de link indisponível.

### Como trocar posts do blog

Procure por:

```ts
function createSampleBlogPosts(): BlogPostItem[] {
```

Cada post tem este formato:

```ts
{
  id: crypto.randomUUID(),
  title: 'Título do post',
  excerpt: 'Resumo curto',
  content: 'Texto completo',
  category: 'Frontend',
  imageUrl: '/nome-da-imagem.png',
  likes: 10,
  views: 100,
  shares: 5,
  published: true,
  updatedAt: daysAgo(1),
}
```

O que editar:

- `title`: título do artigo
- `excerpt`: resumo que aparece no card
- `content`: texto do artigo
- `category`: categoria
- `imageUrl`: imagem do post

### Como trocar habilidades

Procure por:

```ts
function createSampleStacks(): StackItem[] {
```

Cada habilidade tem este formato:

```ts
{
  id: crypto.randomUUID(),
  name: 'React',
  link: 'https://react.dev',
  imageUrl: 'https://placehold.co/600x400?text=React',
  updatedAt: daysAgo(1),
}
```

O que editar:

- `name`: nome da habilidade
- `link`: site oficial
- `imageUrl`: imagem da habilidade

Se `imageUrl` ficar vazio, o admin mostra um placeholder de “Sem imagem”.

## Como trocar imagens

As imagens públicas ficam normalmente em:

- `public/`

Exemplos:

- `public/perfil-pinguim-eletrico.png`
- `public/pinguim-eletrico-cv.txt`

Para usar sua própria imagem:

1. coloque o arquivo dentro da pasta `public`
2. pegue o nome do arquivo
3. use esse caminho no código, começando com `/`

Exemplo:

```ts
profileImagePath: '/minha-foto.png'
```

## Como trocar a imagem de "link indisponível"

Quando um projeto não tem link, o site abre um popup com uma imagem ilustrativa.

Hoje essa imagem é um arquivo dentro da pasta:

- `public/`

Exemplo de arquivo:

- `public/pinguin-em-fuga-no-escritorio.png`

Se você quiser trocar essa imagem:

1. coloque sua nova imagem dentro da pasta `public`
2. use o novo nome do arquivo
3. atualize o caminho no componente do popup

Arquivo para editar:

- `src/components/ProjectLinkDialog.tsx`

Exemplo:

```ts
imageSrc="/pinguin-em-fuga-no-escritorio.png"
```

Se trocar o nome do arquivo, troque também esse caminho.

## Como trocar o currículo

O currículo atual é chamado em:

- `resumePath`

Exemplo:

```ts
resumePath: '/meu-curriculo.pdf'
```

Se quiser usar PDF:

1. coloque o PDF dentro da pasta `public`
2. troque o valor de `resumePath`

## Como usar Supabase

Se você for usar Supabase, o projeto deixa de depender dos dados locais do `storage.ts` para conteúdo salvo no banco.

Você precisa configurar:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Crie um arquivo `.env` baseado no `.env.example`.

Exemplo:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE
```

Depois reinicie o projeto:

```bash
npm run dev
```

## Primeiro login com Supabase

Quando o Supabase estiver configurado, o login deixa de usar o modo local e passa a usar o **Supabase Auth**.

### Muito importante

Este template **não deixa um cadastro público aberto para qualquer pessoa**.

Isso foi feito de propósito para evitar que usuários leigos publiquem o projeto com cadastro livre e acabem permitindo que qualquer pessoa crie conta no painel administrativo.

Em resumo:

- não existe tela pública de cadastro
- o acesso é controlado por você
- isso reduz o risco de abrir o admin para estranhos

### Como criar o primeiro usuário

Este projeto **não traz um SQL pronto no repositório para criar o primeiro usuário de autenticação**.

O jeito mais simples e seguro é criar o usuário diretamente no painel do Supabase:

1. abra o dashboard do Supabase
2. vá em `Authentication`
3. vá em `Users`
4. clique em `Add user`
5. crie o email e a senha do primeiro acesso

Depois disso, use esses dados na rota:

```txt
http://localhost:5173/login
```

### Sobre SQL no Supabase

Você pode usar o SQL Editor do Supabase para criar tabelas, policies, funções e estrutura do banco.

Mas para o **primeiro usuário de login**, este template não inclui um comando SQL pronto.

Se você quiser muito automatizar isso depois, o ideal é fazer isso com bastante cuidado, porque autenticação não é a parte certa para improviso em projeto público.

## Se eu não quiser usar Supabase

Sem problema.

Nesse caso:

- deixe o Supabase sem configurar
- edite os dados direto em `src/lib/storage.ts`
- rode normalmente com `npm run dev`

## Dica importante sobre cache

Às vezes você altera projeto, post ou habilidade e o navegador continua mostrando dados antigos.

Se isso acontecer:

1. feche a aba
2. abra de novo
3. se necessário, limpe o `localStorage` do site

## Arquivos mais importantes do projeto

- `src/lib/site-profile.ts`: nome, bio, contatos e textos principais
- `src/lib/storage.ts`: projetos, posts e habilidades locais
- `src/lib/content-store.ts`: camada que escolhe entre local e Supabase
- `src/lib/media-storage.ts`: upload e remoção de imagens
- `src/lib/client.ts`: conexão com Supabase

## Publicação

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
- chaves privadas
- tokens
- senhas

O projeto já deve manter `.env` fora do Git, mas sempre confira antes de subir.
