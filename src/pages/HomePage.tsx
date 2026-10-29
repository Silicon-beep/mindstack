import { FeaturedProject } from '../components/FeaturedProject'
import { FitsYou } from '../components/FitsYou'
import { Hero } from '../components/Hero'
import { HowItWorks } from '../components/HowItWorks'
import { LearningPaths } from '../components/LearningPaths'
import { MomentumBand } from '../components/MomentumBand'
import { usePageTitle } from '../lib/usePageTitle'

export function HomePage() {
  usePageTitle()
  return (
    <>
      <Hero />
      <LearningPaths />
      <HowItWorks />
      <div className="page-container grid gap-6 py-12 sm:py-16 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <FeaturedProject />
        <FitsYou />
      </div>
      <MomentumBand />
    </>
  )
}
