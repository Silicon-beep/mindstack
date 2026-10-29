import { learningPaths } from '../content'
import { paths, playable } from '../learn/catalog'
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
        {paths.map((path) => {
          const ready = playable(path).length
          return (
            <li key={path.id}>
              <PathCard
                {...path}
                count={learningPaths.lessonCount(ready, path.unit.lessons.length - ready)}
                href={`/paths/${path.id}`}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
