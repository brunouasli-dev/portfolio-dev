import type { BlogPostItem, DashboardState, ProjectItem, StackItem } from '../types/content'

const STORAGE_KEYS = {
  dashboard: 'portfolio.dashboard.state',
  sampleContent: 'portfolio.dashboard.sample-content.v13',
  interactions: 'portfolio.dashboard.interactions.v1',
} as const

const LEGACY_SAMPLE_PROJECT_TITLES = [
  'Neon Commerce Dashboard',
  'DevJobs Match Platform',
  'Portfolio Studio CMS',
  'Realtime Ops Monitor',
  'Green Terminal Analytics',
] as const

const LEGACY_SAMPLE_BLOG_TITLES = [
  'Como estruturo um admin panel antes da home',
  '4 erros comuns em portfólios de desenvolvedor',
  'Usando Supabase Auth em projetos React',
  'Quando vale usar localStorage no painel',
  'Como desenhar cards de portfólio sem poluir a home',
] as const

const seedDashboard = createSeedDashboard()
const emptyInteractions = createEmptyInteractions()

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function normalizeEntityName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function normalizeProjectCopy(project: ProjectItem) {
  return {
    ...project,
    summary:
      project.summary === 'Painel de ecommerce com visao de vendas, estoque e funis comerciais.'
        ? 'Painel de e-commerce com visão de vendas, estoque e funis comerciais.'
        : project.summary ===
            'Aplicacao para conectar recrutadores e devs com filtros por stack e senioridade.'
          ? 'Aplicação para conectar recrutadores e devs com filtros por stack e senioridade.'
          : project.summary ===
              'CMS simples para editar portfolio, projetos e conteudo institucional.'
            ? 'CMS simples para editar portfólio, projetos e conteúdo institucional.'
            : project.summary ===
                'Dashboard com foco em eventos, conversoes e leituras operacionais em tempo real.'
              ? 'Dashboard com foco em eventos, conversões e leituras operacionais em tempo real.'
              : project.summary,
  }
}

function normalizeBlogPostCopy(post: BlogPostItem) {
  const title =
    post.title === '4 erros comuns em portfolios de desenvolvedor'
      ? '4 erros comuns em portfólios de desenvolvedor'
      : post.title === 'Como desenhar cards de portfolio sem poluir a home'
        ? 'Como desenhar cards de portfólio sem poluir a home'
        : post.title

  const excerpt =
    post.excerpt ===
    'Uma abordagem pratica para priorizar painel, autenticacao e dados antes do visual publico.'
      ? 'Uma abordagem prática para priorizar painel, autenticação e dados antes do visual público.'
      : post.excerpt ===
          'Os problemas que mais atrapalham clareza, contratacao e manutencao de um portfolio tecnico.'
        ? 'Os problemas que mais atrapalham clareza, contratação e manutenção de um portfólio técnico.'
        : post.excerpt ===
            'Configuracao inicial, protecao de rotas e cuidados ao mover de login local para auth real.'
          ? 'Configuração inicial, proteção de rotas e cuidados ao mover de login local para auth real.'
          : post.excerpt ===
              'Cenarios em que persistencia local ainda e util para prototipos e validacao de fluxo.'
            ? 'Cenários em que persistência local ainda é útil para protótipos e validação de fluxo.'
            : post.excerpt ===
                'Uma forma de organizar imagem, titulo, descricao e metricas sem transformar a vitrine em bagunca.'
              ? 'Uma forma de organizar imagem, título, descrição e métricas sem transformar a vitrine em bagunça.'
              : post.excerpt

  const content =
    post.content ===
    'Neste post eu mostro como separar a area administrativa em modulos menores e evitar uma pagina unica inchada.'
      ? 'Neste post eu mostro como separar a área administrativa em módulos menores e evitar uma página única inchada.'
      : post.content ===
          'Portfolio bom nao e so visual. Ele precisa comunicar contexto, stack, impacto e facilitar atualizacao.'
        ? 'Portfólio bom não é só visual. Ele precisa comunicar contexto, stack, impacto e facilitar atualização.'
        : post.content ===
            'Supabase Auth resolve autenticacao rapido, mas a implementacao precisa tratar sessao, estado de loading e logout corretamente.'
          ? 'Supabase Auth resolve autenticação rápido, mas a implementação precisa tratar sessão, estado de loading e logout corretamente.'
          : post.content ===
              'Para rascunho e prototipo, localStorage acelera. Para producao, o caminho certo e banco e storage reais.'
            ? 'Para rascunho e protótipo, localStorage acelera. Para produção, o caminho certo é banco e storage reais.'
            : post.content ===
                'Cards bons priorizam hierarquia visual. A imagem abre a leitura, o texto resume e o footer concentra as acoes e metricas.'
              ? 'Cards bons priorizam hierarquia visual. A imagem abre a leitura, o texto resume e o footer concentra as ações e métricas.'
              : post.content

  return {
    ...post,
    title,
    excerpt,
    content,
  }
}

export function ensureSeedData() {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.dashboard)) {
    writeStorage(STORAGE_KEYS.dashboard, seedDashboard)
  }

  ensureSampleContent()
}

export function getDashboardState() {
  ensureSeedData()
  const state = readStorage(STORAGE_KEYS.dashboard, seedDashboard)
  const sanitizedState = sanitizeDashboardState(state)

  return {
    projects: sanitizedState.projects.map((project) => ({
      ...normalizeProjectCopy(project),
      imageUrl: project.imageUrl ?? '',
      imageAlt: project.imageAlt ?? project.title ?? '',
      likes: project.likes ?? 0,
      views: project.views ?? 0,
      shares: project.shares ?? 0,
    })),
    blogPosts: sanitizedState.blogPosts.map((post) => ({
      ...normalizeBlogPostCopy(post),
      content: post.content ?? '',
      imageUrl: post.imageUrl ?? '',
      imageAlt: post.imageAlt ?? post.title ?? '',
      likes: post.likes ?? 0,
      views: post.views ?? 0,
      shares: post.shares ?? 0,
    })),
    stacks: sanitizedState.stacks.map((stack) => ({
      ...stack,
      link: stack.link ?? '',
      imageUrl: stack.imageUrl ?? '',
      imageAlt: stack.imageAlt ?? stack.name ?? '',
    })),
  }
}

export function saveDashboardState(nextState: DashboardState) {
  writeStorage(STORAGE_KEYS.dashboard, nextState)
}

export function sortByUpdatedAtDesc<T extends ProjectItem | BlogPostItem | StackItem>(items: T[]) {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export function getProjectById(projectId: string) {
  return getDashboardState().projects.find((project) => project.id === projectId) ?? null
}

export function getBlogPostById(postId: string) {
  return getDashboardState().blogPosts.find((post) => post.id === postId) ?? null
}

export function incrementProjectMetric(projectId: string, metric: 'likes' | 'views' | 'shares') {
  const state = getDashboardState()
  const nextProjects = state.projects.map((project) =>
    project.id === projectId
      ? {
          ...project,
          [metric]: project[metric] + 1,
        }
      : project,
  )

  const nextState = {
    projects: sortByUpdatedAtDesc(nextProjects),
    blogPosts: state.blogPosts,
    stacks: state.stacks,
  }

  saveDashboardState(nextState)
  return nextState
}

export function incrementBlogPostMetric(postId: string, metric: 'likes' | 'views' | 'shares') {
  const state = getDashboardState()
  const nextPosts = state.blogPosts.map((post) =>
    post.id === postId
      ? {
          ...post,
          [metric]: post[metric] + 1,
        }
      : post,
  )

  const nextState = {
    projects: state.projects,
    blogPosts: sortByUpdatedAtDesc(nextPosts),
    stacks: state.stacks,
  }

  saveDashboardState(nextState)
  return nextState
}

export function getInteractionState() {
  return readStorage(STORAGE_KEYS.interactions, emptyInteractions)
}

export function hasProjectLike(projectId: string) {
  return getInteractionState().projectLikes.includes(projectId)
}

export function hasProjectView(projectId: string) {
  return getInteractionState().projectViews.includes(projectId)
}

export function hasBlogPostLike(postId: string) {
  return getInteractionState().blogLikes.includes(postId)
}

export function hasBlogPostView(postId: string) {
  return getInteractionState().blogViews.includes(postId)
}

export function rememberProjectLike(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectLikes.includes(projectId)) {
    return interactions
  }

  const nextInteractions = {
    ...interactions,
    projectLikes: [...interactions.projectLikes, projectId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)
  return nextInteractions
}

export function rememberProjectView(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectViews.includes(projectId)) {
    return interactions
  }

  const nextInteractions = {
    ...interactions,
    projectViews: [...interactions.projectViews, projectId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)
  return nextInteractions
}

export function rememberBlogPostLike(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogLikes.includes(postId)) {
    return interactions
  }

  const nextInteractions = {
    ...interactions,
    blogLikes: [...interactions.blogLikes, postId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)
  return nextInteractions
}

export function rememberBlogPostView(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogViews.includes(postId)) {
    return interactions
  }

  const nextInteractions = {
    ...interactions,
    blogViews: [...interactions.blogViews, postId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)
  return nextInteractions
}

export function likeProjectOnce(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectLikes.includes(projectId)) {
    return {
      dashboard: getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = incrementProjectMetric(projectId, 'likes')
  const nextInteractions = {
    ...interactions,
    projectLikes: [...interactions.projectLikes, projectId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export function viewProjectOnce(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectViews.includes(projectId)) {
    return {
      dashboard: getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = incrementProjectMetric(projectId, 'views')
  const nextInteractions = {
    ...interactions,
    projectViews: [...interactions.projectViews, projectId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export function likeBlogPostOnce(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogLikes.includes(postId)) {
    return {
      dashboard: getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = incrementBlogPostMetric(postId, 'likes')
  const nextInteractions = {
    ...interactions,
    blogLikes: [...interactions.blogLikes, postId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export function viewBlogPostOnce(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogViews.includes(postId)) {
    return {
      dashboard: getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = incrementBlogPostMetric(postId, 'views')
  const nextInteractions = {
    ...interactions,
    blogViews: [...interactions.blogViews, postId],
  }

  writeStorage(STORAGE_KEYS.interactions, nextInteractions)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

function removeLegacyPlaceholders(state: DashboardState) {
  return {
    projects: state.projects.filter(
      (project) =>
        !(
          project.title === 'Projeto placeholder' &&
          project.summary === 'Esse item existe so para validar o fluxo do painel admin.' &&
          project.stack === 'React, Vite, TypeScript'
        ),
    ),
    blogPosts: state.blogPosts.filter(
      (post) =>
        !(
          post.title === 'Post placeholder' &&
          post.excerpt ===
            'Esse post e temporario e pode ser removido assim que o conteudo real entrar.' &&
          post.category === 'Admin'
        ),
    ),
    stacks: (state.stacks ?? [])
      .filter(
        (stack) =>
          ![
            'Integrações API',
            'Integrações de APIs',
            'Gerenciamento de Servidores',
            'Administração de servidores',
          ].includes(stack.name),
      )
      .map((stack) =>
        stack.name === 'WordPress Plugins'
          ? {
              ...stack,
              name: 'WordPress',
              link: stack.link || 'https://wordpress.org',
            }
          : stack,
      ),
  }
}

function sanitizeDashboardState(state: DashboardState) {
  const withoutPlaceholders = removeLegacyPlaceholders(state)

  const projects = dedupeByKey(
    withoutPlaceholders.projects.filter(
      (project) =>
        !LEGACY_SAMPLE_PROJECT_TITLES.includes(
          project.title as (typeof LEGACY_SAMPLE_PROJECT_TITLES)[number],
        ),
    ),
    (project) => normalizeEntityName(project.title),
  )

  const blogPosts = dedupeByKey(
    withoutPlaceholders.blogPosts.filter(
      (post) =>
        !LEGACY_SAMPLE_BLOG_TITLES.includes(post.title as (typeof LEGACY_SAMPLE_BLOG_TITLES)[number]),
    ),
    (post) => normalizeEntityName(post.title),
  )

  const stacks = dedupeByKey(
    withoutPlaceholders.stacks,
    (stack) => normalizeEntityName(stack.name),
  )

  return {
    projects,
    blogPosts,
    stacks,
  }
}

function ensureSampleContent() {
  if (typeof window === 'undefined') {
    return
  }

  const currentState = sanitizeDashboardState(readStorage(STORAGE_KEYS.dashboard, seedDashboard))
  const nextProjects = mergeSampleProjects(currentState.projects)
  const nextBlogPosts = mergeSampleBlogPosts(currentState.blogPosts)
  const nextStacks = mergeSampleStacks(currentState.stacks)

  const nextState = {
    projects: nextProjects,
    blogPosts: nextBlogPosts,
    stacks: nextStacks,
  }

  writeStorage(STORAGE_KEYS.dashboard, nextState)
  window.localStorage.setItem(STORAGE_KEYS.sampleContent, 'true')
}

function mergeSampleProjects(currentProjects: ProjectItem[]) {
  const sampleProjects = createSampleProjects()
  const sampleTitles = new Set(sampleProjects.map((project) => project.title))
  const filteredProjects = currentProjects.filter(
    (project) =>
      !LEGACY_SAMPLE_PROJECT_TITLES.includes(
        project.title as (typeof LEGACY_SAMPLE_PROJECT_TITLES)[number],
      ),
  )
  const currentTitles = new Set(filteredProjects.map((project) => project.title))

  if (
    currentProjects.length > 0 &&
    filteredProjects.length === 0
  ) {
    return sortByUpdatedAtDesc(sampleProjects)
  }

  const currentByTitle = new Map(filteredProjects.map((project) => [project.title, project]))
  const hydratedProjects = filteredProjects.map((project) => {
    const sampleProject = sampleProjects.find((item) => item.title === project.title)

    if (!sampleProject) {
      return project
    }

    return {
      ...project,
      url: sampleTitles.has(project.title) ? sampleProject.url : project.url,
      imageUrl: project.imageUrl || sampleProject.imageUrl,
      imageAlt: project.imageAlt || sampleProject.imageAlt,
    }
  })

  if (hydratedProjects.length >= 5) {
    return sortByUpdatedAtDesc(hydratedProjects)
  }

  const missingCount = Math.max(0, 5 - hydratedProjects.length)
  const additions = sampleProjects
    .filter((project) => !currentByTitle.has(project.title) && !currentTitles.has(project.title))
    .slice(0, missingCount)

  return sortByUpdatedAtDesc([...hydratedProjects, ...additions])
}

function mergeSampleBlogPosts(currentPosts: BlogPostItem[]) {
  const samplePosts = createSampleBlogPosts()
  const filteredPosts = currentPosts.filter(
    (post) =>
      !LEGACY_SAMPLE_BLOG_TITLES.includes(post.title as (typeof LEGACY_SAMPLE_BLOG_TITLES)[number]),
  )
  const currentTitles = new Set(filteredPosts.map((post) => post.title))

  if (
    currentPosts.length > 0 &&
    filteredPosts.length === 0
  ) {
    return sortByUpdatedAtDesc(samplePosts)
  }

  const currentByTitle = new Map(filteredPosts.map((post) => [post.title, post]))
  const hydratedPosts = filteredPosts.map((post) => {
    const samplePost = samplePosts.find((item) => item.title === post.title)

    if (!samplePost) {
      return post
    }

    return {
      ...post,
      imageUrl: post.imageUrl || samplePost.imageUrl,
      imageAlt: post.imageAlt || samplePost.imageAlt,
      likes: post.likes ?? samplePost.likes,
      views: post.views ?? samplePost.views,
      shares: post.shares ?? samplePost.shares,
    }
  })

  if (hydratedPosts.length >= 5) {
    return sortByUpdatedAtDesc(hydratedPosts)
  }

  const missingCount = Math.max(0, 5 - hydratedPosts.length)
  const additions = samplePosts
    .filter((post) => !currentByTitle.has(post.title) && !currentTitles.has(post.title))
    .slice(0, missingCount)

  return sortByUpdatedAtDesc([...hydratedPosts, ...additions])
}

function createSeedDashboard(): DashboardState {
  return {
    projects: [],
    blogPosts: [],
    stacks: [],
  }
}

function mergeSampleStacks(currentStacks: StackItem[]) {
  const sampleStacks = createSampleStacks()
  const currentByName = new Map(currentStacks.map((stack) => [stack.name, stack]))
  const hydratedStacks = currentStacks.map((stack) => {
    const sampleStack = sampleStacks.find((item) => item.name === stack.name)

    if (!sampleStack) {
      return stack
    }

    return {
      ...stack,
      imageUrl: sampleStack.imageUrl || stack.imageUrl,
      imageAlt: stack.imageAlt || sampleStack.imageAlt,
      link: stack.link || sampleStack.link,
    }
  })

  if (hydratedStacks.length >= sampleStacks.length) {
    return sortByUpdatedAtDesc(hydratedStacks)
  }

  const missingCount = Math.max(0, sampleStacks.length - hydratedStacks.length)
  const additions = sampleStacks
    .filter((stack) => !currentByName.has(stack.name))
    .slice(0, missingCount)

  return sortByUpdatedAtDesc([...hydratedStacks, ...additions])
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = getKey(item)

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function createEmptyInteractions() {
  return {
    projectLikes: [] as string[],
    projectViews: [] as string[],
    blogLikes: [] as string[],
    blogViews: [] as string[],
  }
}

function createSampleProjects(): ProjectItem[] {
  return [
    {
      id: crypto.randomUUID(),
      title: 'Painel da Fábrica de Raios',
      summary: 'Pinguim Trovoada passou para o Pinguim Elétrico a tarefa de montar um dashboard para vigiar a produção de raios engarrafados. O Elétrico conseguiu organizar boa parte da interface, mas esqueceu alertas importantes, quase cozinhou as bobinas e obrigou o Trovoada a correr para salvar o laboratório e a dignidade do projeto.',
      stack: 'React, TypeScript, Recharts, Node.js',
      url: '',
      imageUrl: '/penguins-enfrentam-caos-no-laboratorio-eletrico.png',
      imageAlt: 'Pinguins enfrentando caos no laboratório elétrico cercados por raios, cabos e telas de monitoramento.',
      likes: 38,
      views: 512,
      shares: 19,
      published: true,
      updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(),
      title: 'Loja Oficial do Gelo Gourmet',
      summary: 'Pinguim Trovoada pediu ao Pinguim Elétrico uma loja elegante para vender gelo gourmet sem parecer uma piada interna congelada. O Elétrico fez a vitrine, inventou moda no checkout, tropeçou no fluxo de compra e o Trovoada teve que entrar derrapando para resfriar a situação antes que o carrinho virasse um esporte radical.',
      stack: 'Next.js, TypeScript, PostgreSQL, Redis',
      url: '',
      imageUrl: '/aperto-no-balcao-de-gelo.png',
      imageAlt: 'Pinguins tensos no balcão de uma loja de gelo gourmet tentando salvar o fluxo de compra.',
      likes: 42,
      views: 603,
      shares: 23,
      published: true,
      updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(),
      title: 'CMS do Clube dos Pinguins Nervosos',
      summary: 'Pinguim Trovoada passou a missão de criar um CMS que evitasse chamado técnico para cada banner urgente ou comunicado dramático do clube. O Elétrico entregou liberdade demais, abriu espaço para pequenos crimes visuais e o Trovoada precisou voltar correndo para colocar limites antes que o painel virasse um festival de decisões ruins.',
      stack: 'React, Supabase, Tailwind CSS, Storage',
      url: '',
      imageUrl: '/desafio-no-painel-de-controle.png',
      imageAlt: 'Pinguins encarando um painel de controle cheio de botões e decisões perigosas de interface.',
      likes: 29,
      views: 447,
      shares: 14,
      published: true,
      updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(),
      title: 'Central de Resgate do Pinguim Elétrico',
      summary: 'Pinguim Trovoada mandou o Pinguim Elétrico montar um painel simples para registrar bugs, pedidos de socorro e acidentes de percurso sem depender de planilha perdida no gelo. O Elétrico quase transformou o resgate em nova emergência, deixou coisa demais sem prioridade e o Trovoada precisou aparecer para colocar ordem no caos antes do próximo cascudo coletivo.',
      stack: 'React, WebSocket, Express, PostgreSQL',
      url: '',
      imageUrl: '/pinguins-em-crise-no-painel-de-alertas.png',
      imageAlt: 'Pinguins em crise observando um painel de alertas com sinais de emergência e bugs.',
      likes: 24,
      views: 331,
      shares: 12,
      published: true,
      updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(),
      title: 'Radar de Cascudos do Trovoada',
      summary: 'Pinguim Trovoada entregou ao Pinguim Elétrico a missão de medir retrabalho, bugs reincidentes e o risco de bronca em produção sem transformar tudo em achismo colorido. O Elétrico montou os gráficos com confiança questionável, errou parte das métricas e o Trovoada teve que revisar a análise inteira antes que os números começassem a mentir com boa tipografia.',
      stack: 'React, Recharts, Supabase, SQL',
      url: '',
      imageUrl: '/penguins-em-crise-no-escritorio.png',
      imageAlt: 'Pinguins preocupados no escritório olhando gráficos e métricas que claramente deram errado.',
      likes: 35,
      views: 489,
      shares: 21,
      published: true,
      updatedAt: daysAgo(5),
    },
  ]
}

function createSampleBlogPosts(): BlogPostItem[] {
  return [
    {
      id: crypto.randomUUID(),
      title: 'Como sobreviver ao primeiro admin panel sem congelar',
      excerpt: 'Pinguim Trovoada passou a tarefa de montar um admin panel decente, o Elétrico esqueceu metade dos cenários perigosos e o texto explica como o resgate aconteceu antes da tragédia operacional.',
      content:
        'Pinguim Trovoada passou ao Pinguim Elétrico a tarefa de montar um admin panel que prestasse para uso diário, não só para screenshot bonito. O Elétrico foi valente, montou tabela, botão azul e campo de busca com autoconfiança acima do recomendado. Pouco depois apareceram permissão, estado vazio, erro, ação perigosa e fluxo repetitivo, tudo ao mesmo tempo, como manda o folclore do software administrativo. O Trovoada entrou na revisão, apontou os buracos com precisão glacial e mostrou que painel bom precisa cansar menos do que o operador. O resultado foi um admin menos enfeitado, menos ingênuo e muito mais utilizável.',
      category: 'Produto',
      imageUrl: '/penguins-em-panico-no-escritorio-de-ti.png',
      imageAlt: 'Pinguins em pânico em um escritório de TI tentando sobreviver ao primeiro painel administrativo.',
      likes: 26,
      views: 314,
      shares: 15,
      published: true,
      updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(),
      title: 'Quatro sinais de que a interface está bonita, mas pronta coisa nenhuma',
      excerpt: 'Pinguim Trovoada pediu uma interface pronta para uso real, o Elétrico entregou algo bonito demais e robusto de menos, e sobrou bronca suficiente para virar post.',
      content:
        'Pinguim Trovoada pediu ao Pinguim Elétrico uma interface pronta para uso real, com cara de produto e estrutura para aguentar o mundo fora da demo. O Elétrico entregou algo bonito, alinhado, cheio de brilho e completamente despreparado para o primeiro clique torto vindo do usuário. Foi aí que ouviu, com toda a ternura possível de um sênior congelado, que caminho feliz não paga boleto nem segura produto no ar. Interface pronta de verdade aguenta conexão lenta, erro, confirmação, cancelamento e informação esquisita sem implorar por misericórdia. O resto é cartaz com autoestima alta tentando se passar por software maduro.',
      category: 'Design de Produto',
      imageUrl: '/pinguins-em-crise-no-escritorio-e-eletrico-com-medo-do-dialogo.png',
      imageAlt: 'Pinguins em crise no escritório enquanto o Pinguim Elétrico encara um diálogo que deu errado.',
      likes: 31,
      views: 402,
      shares: 18,
      published: true,
      updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(),
      title: 'Como plugar uma API sem transformar o front em geleia',
      excerpt: 'Pinguim Trovoada passou uma integração aparentemente simples, o Elétrico confiou demais no payload e descobriu rápido como nasce uma geleia arquitetural.',
      content:
        'Pinguim Trovoada passou para o Pinguim Elétrico uma integração que, no papel, parecia civilizada e sem armadilha. O Elétrico acreditou demais nisso, ligou API direto no componente e prometeu para si mesmo que arrumaria o resto depois. O depois chegou em velocidade absurda: payload torto, fallback improvisado e regra de negócio brotando onde não devia nem respirar. O Trovoada olhou a cena, respirou fundo e explicou que integração mal isolada vira geleia arquitetural em dois dias úteis. A correção veio separando contrato, adaptação de dados e leitura de erro, deixando a interface livre para fazer o que realmente importa sem colapsar no processo.',
      category: 'Arquitetura',
      imageUrl: '/pinguins-enfrentando-integracao-de-apis.png',
      imageAlt: 'Pinguins enfrentando uma integração de APIs cercados por telas, dados e sinais de erro.',
      likes: 28,
      views: 356,
      shares: 16,
      published: true,
      updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(),
      title: 'Quando tempo real ajuda e quando é só firula com gráfico piscando',
      excerpt: 'Pinguim Trovoada queria um dashboard útil, o Elétrico queria tudo piscando ao vivo, e o aprendizado veio no momento em que alguém perguntou se aquilo ajudava mesmo a decidir alguma coisa.',
      content:
        'Pinguim Trovoada pediu ao Pinguim Elétrico um dashboard útil para operação, mas o Elétrico interpretou isso como licença poética para criar uma central nuclear cenográfica com gráfico piscando em tudo que fosse canto. Na cabeça dele, número pulando significava relevância. Na prática, o Trovoada lembrou que tempo real custa arquitetura, atenção e um pedaço considerável da sanidade de quem dá manutenção. Se a operação decide algo a cada cinco minutos, polling curto resolve. Se a análise é diária, gráfico piscando é só teatro técnico com orçamento alto. Foi assim que o dashboard parou de tentar impressionar e começou a ajudar alguém de verdade.',
      category: 'Dados',
      imageUrl: '/pinguins-em-acao-frente-ao-painel.png',
      imageAlt: 'Pinguins diante de um grande painel de dados tentando entender o que realmente importa em tempo real.',
      likes: 17,
      views: 241,
      shares: 9,
      published: true,
      updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(),
      title: 'A diferença entre componentizar certo e sair criando CardUniversalPremium',
      excerpt: 'Pinguim Trovoada pediu organização de componentes, o Elétrico entendeu “crie abstrações com nomes perigosos”, e a correção veio antes que nascesse uma biblioteca impossível de manter.',
      content:
        'Pinguim Trovoada pediu ao Pinguim Elétrico que organizasse os componentes do projeto para evitar repetição boba e acelerar a manutenção. O Elétrico entendeu a missão do jeito mais perigoso possível: decidiu que toda caixinha com sombra suave merecia virar componente global. Foi assim que quase nasceu o infame CardUniversalPremium, primo do BoxMasterFlex e de outras entidades que jamais deveriam ver a luz do monitor. O Trovoada interveio a tempo e explicou o critério real: componentizar o que compartilha intenção, comportamento e regra de uso, não só aparência. Quando o componente nasce do contexto certo, ele acelera o produto. Quando nasce do ego, ele só ganha nome pomposo, documentação esquecida e um futuro triste na próxima refatoração.',
      category: 'Frontend',
      imageUrl: '/penguin-batalha-no-escritorio-de-ui.png',
      imageAlt: 'Pinguins em batalha em um escritório de UI discutindo componentes e decisões de interface.',
      likes: 23,
      views: 287,
      shares: 13,
      published: true,
      updatedAt: daysAgo(5),
    },
  ]
}

function createSampleStacks(): StackItem[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'React',
      link: 'https://react.dev',
      imageUrl: 'https://placehold.co/600x400?text=React',
      imageAlt: 'Placeholder com o nome React.',
      updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(),
      name: 'TypeScript',
      link: 'https://www.typescriptlang.org',
      imageUrl: 'https://placehold.co/600x400?text=TypeScript',
      imageAlt: 'Placeholder com o nome TypeScript.',
      updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(),
      name: 'Node.js',
      link: 'https://nodejs.org',
      imageUrl: 'https://placehold.co/600x400?text=Node.js',
      imageAlt: 'Placeholder com o nome Node.js.',
      updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(),
      name: 'Supabase',
      link: 'https://supabase.com',
      imageUrl: 'https://placehold.co/600x400?text=Supabase',
      imageAlt: 'Placeholder com o nome Supabase.',
      updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(),
      name: 'PostgreSQL',
      link: 'https://www.postgresql.org',
      imageUrl: 'https://placehold.co/600x400?text=PostgreSQL',
      imageAlt: 'Placeholder com o nome PostgreSQL.',
      updatedAt: daysAgo(5),
    },
    {
      id: crypto.randomUUID(),
      name: 'PHP',
      link: 'https://www.php.net',
      imageUrl: 'https://placehold.co/600x400?text=PHP',
      imageAlt: 'Placeholder com o nome PHP.',
      updatedAt: daysAgo(6),
    },
    {
      id: crypto.randomUUID(),
      name: 'HTML',
      link: 'https://developer.mozilla.org/docs/Web/HTML',
      imageUrl: 'https://placehold.co/600x400?text=HTML',
      imageAlt: 'Placeholder com o nome HTML.',
      updatedAt: daysAgo(7),
    },
    {
      id: crypto.randomUUID(),
      name: 'CSS',
      link: 'https://developer.mozilla.org/docs/Web/CSS',
      imageUrl: 'https://placehold.co/600x400?text=CSS',
      imageAlt: 'Placeholder com o nome CSS.',
      updatedAt: daysAgo(8),
    },
    {
      id: crypto.randomUUID(),
      name: 'Next.js',
      link: 'https://nextjs.org',
      imageUrl: 'https://placehold.co/600x400?text=Next.js',
      imageAlt: 'Placeholder com o nome Next.js.',
      updatedAt: daysAgo(9),
    },
    {
      id: crypto.randomUUID(),
      name: 'GitHub',
      link: 'https://github.com',
      imageUrl: 'https://placehold.co/600x400?text=GitHub',
      imageAlt: 'Placeholder com o nome GitHub.',
      updatedAt: daysAgo(10),
    },
    {
      id: crypto.randomUUID(),
      name: 'Tailwind CSS',
      link: 'https://tailwindcss.com',
      imageUrl: 'https://placehold.co/600x400?text=Tailwind',
      imageAlt: 'Placeholder com o nome Tailwind CSS.',
      updatedAt: daysAgo(11),
    },
    {
      id: crypto.randomUUID(),
      name: 'Docker',
      link: 'https://www.docker.com',
      imageUrl: 'https://placehold.co/600x400?text=Docker',
      imageAlt: 'Placeholder com o nome Docker.',
      updatedAt: daysAgo(12),
    },
    {
      id: crypto.randomUUID(),
      name: 'WordPress',
      link: 'https://wordpress.org',
      imageUrl: 'https://placehold.co/600x400?text=WordPress',
      imageAlt: 'Placeholder com o nome WordPress.',
      updatedAt: daysAgo(13),
    },
    {
      id: crypto.randomUUID(),
      name: 'WooCommerce',
      link: 'https://woocommerce.com',
      imageUrl: 'https://placehold.co/600x400?text=WooCommerce',
      imageAlt: 'Placeholder com o nome WooCommerce.',
      updatedAt: daysAgo(14),
    },
    {
      id: crypto.randomUUID(),
      name: 'Tray',
      link: 'https://tray.com.br',
      imageUrl: 'https://placehold.co/600x400?text=Tray',
      imageAlt: 'Placeholder com o nome Tray.',
      updatedAt: daysAgo(15),
    },
    {
      id: crypto.randomUUID(),
      name: 'Nuvemshop',
      link: 'https://www.nuvemshop.com.br',
      imageUrl: 'https://placehold.co/600x400?text=Nuvemshop',
      imageAlt: 'Placeholder com o nome Nuvemshop.',
      updatedAt: daysAgo(16),
    },
    {
      id: crypto.randomUUID(),
      name: 'JavaScript',
      link: 'https://developer.mozilla.org/docs/Web/JavaScript',
      imageUrl: 'https://placehold.co/600x400?text=JavaScript',
      imageAlt: 'Placeholder com o nome JavaScript.',
      updatedAt: daysAgo(17),
    },
    {
      id: crypto.randomUUID(),
      name: 'MySQL',
      link: 'https://www.mysql.com',
      imageUrl: 'https://placehold.co/600x400?text=MySQL',
      imageAlt: 'Placeholder com o nome MySQL.',
      updatedAt: daysAgo(18),
    },
    {
      id: crypto.randomUUID(),
      name: 'Git',
      link: 'https://git-scm.com',
      imageUrl: 'https://placehold.co/600x400?text=Git',
      imageAlt: 'Placeholder com o nome Git.',
      updatedAt: daysAgo(19),
    },
    {
      id: crypto.randomUUID(),
      name: 'Linux',
      link: 'https://kernel.org',
      imageUrl: 'https://placehold.co/600x400?text=Linux',
      imageAlt: 'Placeholder com o nome Linux.',
      updatedAt: daysAgo(20),
    },
    {
      id: crypto.randomUUID(),
      name: 'APIs REST',
      link: 'https://swagger.io/resources/articles/best-practices-in-api-design/',
      imageUrl: 'https://placehold.co/600x400?text=REST+API',
      imageAlt: 'Placeholder com o nome APIs REST.',
      updatedAt: daysAgo(21),
    },
  ]
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}
