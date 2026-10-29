import { learningPaths } from '../content'
import { PathCard } from './PathCard'
import { SectionHeader } from './SectionHeader'

export function LearningPaths() {
  return (
    <section id="paths" aria-labelledby="paths-title" className="page-container py-12 sm:py-16">
      <SectionHeader
        id="paths-title"
        eyebrow={learningPaths.eyebrow}
        title={learningPaths.title}
        subtitle={learningPaths.subtitle}
      />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {learningPaths.paths.map((path) => (
          <li key={path.title}>
            <PathCard {...path} href={`/paths/${path.id}`} />
          </li>
        ))}
      </ul>
    </section>
  )
}
