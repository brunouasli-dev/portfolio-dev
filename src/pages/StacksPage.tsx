import { useEffect, useState } from 'react'
import { StackLogo } from '../components/StackLogo'
import { getDashboardState, getEmptyDashboardState } from '../lib/content-store'

export function StacksPage() {
  const [stacks, setStacks] = useState(getEmptyDashboardState().stacks)

  useEffect(() => {
    let active = true

    async function loadStacks() {
      const dashboard = await getDashboardState()

      if (!active) {
        return
      }

      setStacks(dashboard.stacks)
    }

    void loadStacks()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="catalog-layout">
      <section className="catalog-hero panel">
        <span className="eyebrow">HABILIDADES</span>
        <h1>Todas as habilidades</h1>
        <p>
          Habilidades, ferramentas e plataformas que fazem parte da minha experiência prática no
          desenvolvimento de sites, aplicações web, APIs e produtos digitais.
        </p>
      </section>

      <section className="catalog-grid catalog-grid-stacks">
        {stacks.map((stack) => (
          <article key={stack.id} className="carousel-card catalog-card stacks-carousel-card">
            <div className="carousel-media">
              <StackLogo name={stack.name} imageUrl={stack.imageUrl} />
            </div>

            <div className="carousel-card-body">
              <h3>{stack.name}</h3>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}
