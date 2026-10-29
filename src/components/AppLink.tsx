import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

// Internal paths go through the router, so moving between pages never reloads. Anything else is a plain link.
export function AppLink({ href, ...rest }: AppLinkProps) {
  return href.startsWith('/') ? <Link to={href} {...rest} /> : <a href={href} {...rest} />
}
