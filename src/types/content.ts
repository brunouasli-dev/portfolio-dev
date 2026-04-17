export type ProjectItem = {
  id: string
  title: string
  summary: string
  stack: string
  url: string
  imageUrl: string
  imageAlt: string
  likes: number
  views: number
  shares: number
  published: boolean
  updatedAt: string
}

export type BlogPostItem = {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  imageUrl: string
  imageAlt: string
  likes: number
  views: number
  shares: number
  published: boolean
  updatedAt: string
}

export type StackItem = {
  id: string
  name: string
  link: string
  imageUrl: string
  imageAlt: string
  updatedAt: string
}

export type DashboardState = {
  projects: ProjectItem[]
  blogPosts: BlogPostItem[]
  stacks: StackItem[]
}

export type AuthSession = {
  email: string
  loggedAt: string
}
