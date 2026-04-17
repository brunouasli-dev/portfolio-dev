import { isSupabaseConfigured, supabase } from './client'
import {
  getDashboardState as getLocalDashboardState,
  getInteractionState,
  incrementBlogPostMetric as incrementLocalBlogPostMetric,
  incrementProjectMetric as incrementLocalProjectMetric,
  rememberBlogPostLike,
  rememberBlogPostView,
  rememberProjectLike,
  rememberProjectView,
  saveDashboardState as saveLocalDashboardState,
  sortByUpdatedAtDesc,
} from './storage'
import type { BlogPostItem, DashboardState, ProjectItem, StackItem } from '../types/content'

const EMPTY_DASHBOARD_STATE: DashboardState = {
  projects: [],
  blogPosts: [],
  stacks: [],
}

const DASHBOARD_CACHE_KEY = 'portfolio.dashboard.remote-cache.v2'
const DASHBOARD_CACHE_TTL = 1000 * 60 * 3

let hasLoggedFallbackWarning = false
let memoryDashboardCache: DashboardState | null = null
let memoryDashboardCacheAt = 0

type ProjectRow = {
  id: string
  title: string
  summary: string
  stack: string
  url: string
  image_url: string
  image_alt?: string
  likes: number
  views: number
  shares: number
  published: boolean
  updated_at: string
}

type BlogPostRow = {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  image_url: string
  image_alt?: string
  likes: number
  views: number
  shares: number
  published: boolean
  updated_at: string
}

type StackRow = {
  id: string
  name: string
  link: string
  image_url: string
  image_alt?: string
  updated_at: string
}

type DashboardCachePayload = {
  savedAt: number
  state: DashboardState
}

function logFallbackWarning(error: unknown) {
  if (hasLoggedFallbackWarning) {
    return
  }

  hasLoggedFallbackWarning = true
  console.warn('Supabase content fallback ativo.', error)
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function shouldUseLocalFallback(error: unknown) {
  const message = errorMessage(error)

  return [
    'Supabase client not configured',
    'Failed to fetch',
    'FetchError',
    'network',
    'Could not find the table',
    'schema cache',
    'relation',
    'does not exist',
    'Could not find the function',
    'PGRST',
  ].some((fragment) => message.toLowerCase().includes(fragment.toLowerCase()))
}

function mapProjectRow(row: ProjectRow): ProjectItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    stack: row.stack,
    url: row.url,
    imageUrl: row.image_url,
    imageAlt: row.image_alt ?? row.title,
    likes: row.likes,
    views: row.views,
    shares: row.shares,
    published: row.published,
    updatedAt: row.updated_at,
  }
}

function mapBlogPostRow(row: BlogPostRow): BlogPostItem {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    imageUrl: row.image_url,
    imageAlt: row.image_alt ?? row.title,
    likes: row.likes,
    views: row.views,
    shares: row.shares,
    published: row.published,
    updatedAt: row.updated_at,
  }
}

function mapStackRow(row: StackRow): StackItem {
  return {
    id: row.id,
    name: row.name,
    link: row.link,
    imageUrl: row.image_url,
    imageAlt: row.image_alt ?? row.name,
    updatedAt: row.updated_at,
  }
}

function cloneDashboardState(state: DashboardState): DashboardState {
  return {
    projects: [...state.projects],
    blogPosts: [...state.blogPosts],
    stacks: [...state.stacks],
  }
}

function stripHeavyImagesForCache(state: DashboardState): DashboardState {
  return {
    projects: state.projects.map((project) => ({
      ...project,
      imageUrl: project.imageUrl.startsWith('data:') ? '' : project.imageUrl,
    })),
    blogPosts: state.blogPosts.map((post) => ({
      ...post,
      imageUrl: post.imageUrl.startsWith('data:') ? '' : post.imageUrl,
    })),
    stacks: state.stacks.map((stack) => ({
      ...stack,
      imageUrl: stack.imageUrl.startsWith('data:') ? '' : stack.imageUrl,
    })),
  }
}

function isDashboardCacheFresh(savedAt: number) {
  return Date.now() - savedAt < DASHBOARD_CACHE_TTL
}

function readDashboardCache() {
  if (typeof window === 'undefined') {
    return memoryDashboardCache ? cloneDashboardState(memoryDashboardCache) : null
  }

  if (memoryDashboardCache && isDashboardCacheFresh(memoryDashboardCacheAt)) {
    return cloneDashboardState(memoryDashboardCache)
  }

  const rawCache = window.localStorage.getItem(DASHBOARD_CACHE_KEY)

  if (!rawCache) {
    return null
  }

  try {
    const parsed = JSON.parse(rawCache) as DashboardCachePayload

    if (!parsed?.savedAt || !parsed?.state || !isDashboardCacheFresh(parsed.savedAt)) {
      window.localStorage.removeItem(DASHBOARD_CACHE_KEY)
      return null
    }

    memoryDashboardCache = cloneDashboardState(parsed.state)
    memoryDashboardCacheAt = parsed.savedAt

    return cloneDashboardState(parsed.state)
  } catch {
    window.localStorage.removeItem(DASHBOARD_CACHE_KEY)
    memoryDashboardCache = null
    memoryDashboardCacheAt = 0
    return null
  }
}

function writeDashboardCache(state: DashboardState) {
  const nextState = cloneDashboardState(state)
  const savedAt = Date.now()

  memoryDashboardCache = nextState
  memoryDashboardCacheAt = savedAt

  if (typeof window !== 'undefined') {
    const payload: DashboardCachePayload = {
      savedAt,
      state: stripHeavyImagesForCache(nextState),
    }

    try {
      window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(payload))
    } catch {
      window.localStorage.removeItem(DASHBOARD_CACHE_KEY)
    }
  }

  return cloneDashboardState(nextState)
}

function toProjectPayload(project: ProjectItem) {
  return {
    id: project.id,
    title: project.title.trim(),
    summary: project.summary.trim(),
    stack: project.stack.trim(),
    url: project.url.trim(),
    image_url: project.imageUrl,
    image_alt: project.imageAlt.trim(),
    likes: project.likes,
    views: project.views,
    shares: project.shares,
    published: project.published,
  }
}

function toBlogPostPayload(post: BlogPostItem) {
  return {
    id: post.id,
    title: post.title.trim(),
    excerpt: post.excerpt.trim(),
    content: post.content.trim(),
    category: post.category.trim(),
    image_url: post.imageUrl,
    image_alt: post.imageAlt.trim(),
    likes: post.likes,
    views: post.views,
    shares: post.shares,
    published: post.published,
  }
}

function toStackPayload(stack: StackItem) {
  return {
    id: stack.id,
    name: stack.name.trim(),
    link: stack.link.trim(),
    image_url: stack.imageUrl,
    image_alt: stack.imageAlt.trim(),
  }
}

function persistLocalDashboardState(nextState: DashboardState) {
  const sortedState = {
    projects: sortByUpdatedAtDesc(nextState.projects),
    blogPosts: sortByUpdatedAtDesc(nextState.blogPosts),
    stacks: sortByUpdatedAtDesc(nextState.stacks),
  }

  saveLocalDashboardState(sortedState)
  writeDashboardCache(sortedState)

  return getLocalDashboardState()
}

async function readRemoteDashboardState(): Promise<DashboardState> {
  const [projectsResult, blogPostsResult, stacksResult] = await Promise.all([
    supabase.from('projects').select('*').order('updated_at', { ascending: false }),
    supabase.from('blog_posts').select('*').order('updated_at', { ascending: false }),
    supabase.from('stacks').select('*').order('updated_at', { ascending: false }),
  ])

  if (projectsResult.error) {
    throw new Error(projectsResult.error.message)
  }

  if (blogPostsResult.error) {
    throw new Error(blogPostsResult.error.message)
  }

  if (stacksResult.error) {
    throw new Error(stacksResult.error.message)
  }

  return writeDashboardCache({
    projects: (projectsResult.data ?? []).map((row) => mapProjectRow(row as ProjectRow)),
    blogPosts: (blogPostsResult.data ?? []).map((row) => mapBlogPostRow(row as BlogPostRow)),
    stacks: (stacksResult.data ?? []).map((row) => mapStackRow(row as StackRow)),
  })
}

async function withDashboardFallback<T>(
  remoteOperation: () => Promise<T>,
  localOperation: () => T | Promise<T>,
) {
  try {
    return await remoteOperation()
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error
    }

    logFallbackWarning(error)
    return await localOperation()
  }
}

export async function getDashboardState() {
  const cachedState = readDashboardCache()

  if (cachedState) {
    return cachedState
  }

  if (!isSupabaseConfigured) {
    return getLocalDashboardState()
  }

  return withDashboardFallback(readRemoteDashboardState, () => getLocalDashboardState())
}

export function getEmptyDashboardState() {
  return {
    projects: [...EMPTY_DASHBOARD_STATE.projects],
    blogPosts: [...EMPTY_DASHBOARD_STATE.blogPosts],
    stacks: [...EMPTY_DASHBOARD_STATE.stacks],
  }
}

export function getDashboardInteractions() {
  return getInteractionState()
}

export async function saveProject(project: ProjectItem) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('projects').upsert(toProjectPayload(project))

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()
      const nextProjects = current.projects.some((item) => item.id === project.id)
        ? current.projects.map((item) => (item.id === project.id ? project : item))
        : [project, ...current.projects]

      return persistLocalDashboardState({
        projects: nextProjects,
        blogPosts: current.blogPosts,
        stacks: current.stacks,
      })
    },
  )
}

export async function deleteProject(projectId: string) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()

      return persistLocalDashboardState({
        projects: current.projects.filter((item) => item.id !== projectId),
        blogPosts: current.blogPosts,
        stacks: current.stacks,
      })
    },
  )
}

export async function incrementProjectMetric(projectId: string, metric: 'likes' | 'views' | 'shares') {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.rpc('increment_project_metric', {
        metric_name: metric,
        project_id: projectId,
      })

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => incrementLocalProjectMetric(projectId, metric),
  )
}

export async function saveBlogPost(post: BlogPostItem) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('blog_posts').upsert(toBlogPostPayload(post))

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()
      const nextPosts = current.blogPosts.some((item) => item.id === post.id)
        ? current.blogPosts.map((item) => (item.id === post.id ? post : item))
        : [post, ...current.blogPosts]

      return persistLocalDashboardState({
        projects: current.projects,
        blogPosts: nextPosts,
        stacks: current.stacks,
      })
    },
  )
}

export async function deleteBlogPost(postId: string) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()

      return persistLocalDashboardState({
        projects: current.projects,
        blogPosts: current.blogPosts.filter((item) => item.id !== postId),
        stacks: current.stacks,
      })
    },
  )
}

export async function incrementBlogPostMetric(postId: string, metric: 'likes' | 'views' | 'shares') {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.rpc('increment_blog_post_metric', {
        metric_name: metric,
        post_id: postId,
      })

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => incrementLocalBlogPostMetric(postId, metric),
  )
}

export async function saveStack(stack: StackItem) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('stacks').upsert(toStackPayload(stack))

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()
      const nextStacks = current.stacks.some((item) => item.id === stack.id)
        ? current.stacks.map((item) => (item.id === stack.id ? stack : item))
        : [stack, ...current.stacks]

      return persistLocalDashboardState({
        projects: current.projects,
        blogPosts: current.blogPosts,
        stacks: nextStacks,
      })
    },
  )
}

export async function deleteStack(stackId: string) {
  return withDashboardFallback(
    async () => {
      const { error } = await supabase.from('stacks').delete().eq('id', stackId)

      if (error) {
        throw new Error(error.message)
      }

      return await readRemoteDashboardState()
    },
    () => {
      const current = getLocalDashboardState()

      return persistLocalDashboardState({
        projects: current.projects,
        blogPosts: current.blogPosts,
        stacks: current.stacks.filter((item) => item.id !== stackId),
      })
    },
  )
}

export async function likeProjectOnce(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectLikes.includes(projectId)) {
    return {
      dashboard: await getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = await incrementProjectMetric(projectId, 'likes')
  const nextInteractions = rememberProjectLike(projectId)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export async function viewProjectOnce(projectId: string) {
  const interactions = getInteractionState()

  if (interactions.projectViews.includes(projectId)) {
    return {
      dashboard: await getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = await incrementProjectMetric(projectId, 'views')
  const nextInteractions = rememberProjectView(projectId)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export async function likeBlogPostOnce(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogLikes.includes(postId)) {
    return {
      dashboard: await getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = await incrementBlogPostMetric(postId, 'likes')
  const nextInteractions = rememberBlogPostLike(postId)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}

export async function viewBlogPostOnce(postId: string) {
  const interactions = getInteractionState()

  if (interactions.blogViews.includes(postId)) {
    return {
      dashboard: await getDashboardState(),
      interactions,
      changed: false,
    }
  }

  const dashboard = await incrementBlogPostMetric(postId, 'views')
  const nextInteractions = rememberBlogPostView(postId)

  return {
    dashboard,
    interactions: nextInteractions,
    changed: true,
  }
}
