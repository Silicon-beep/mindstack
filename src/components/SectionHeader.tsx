type SectionHeaderProps = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
}

export function SectionHeader({ id, eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-lg leading-relaxed text-muted">{subtitle}</p>
    </div>
  )
}
