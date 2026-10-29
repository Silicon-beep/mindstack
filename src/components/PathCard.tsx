import { ArrowRight, type LucideIcon } from 'lucide-react'
import { tones, type Tone } from '../lib/tones'
import { AppLink } from './AppLink'

export type PathCardProps = {
  title: string
  description: string
  projects: string
  icon: LucideIcon
  tone: Tone
  href: string
}

export function PathCard({ title, description, projects, icon: Icon, tone, href }: PathCardProps) {
  const t = tones[tone]
  return (
    <AppLink
      href={href}
      className={`group flex h-full flex-col rounded-card border border-line p-6 shadow-soft transition duration-200 ease-out hover:shadow-lift motion-safe:hover:-translate-y-1 ${t.tint}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.iconBg} ${t.text}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted">{description}</p>
      <span className="mt-6 flex items-center justify-between">
        <span className={`text-sm font-semibold ${t.text}`}>{projects}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white ${t.text}`}>
          <ArrowRight className="h-5 w-5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </span>
      </span>
    </AppLink>
  )
}
