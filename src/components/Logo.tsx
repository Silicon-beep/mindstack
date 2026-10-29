import { Layers } from 'lucide-react'
import { brand } from '../content'
import { AppLink } from './AppLink'

export function Logo() {
  return (
    <AppLink href="/" className="inline-flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet text-white">
        <Layers className="h-[22px] w-[22px]" />
      </span>
      <span className="text-xl font-bold tracking-tight">{brand.name}</span>
    </AppLink>
  )
}
