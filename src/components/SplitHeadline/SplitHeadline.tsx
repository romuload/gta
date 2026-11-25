import type { ElementType } from 'react'

interface Props {
  lines: readonly string[]
  as?: ElementType
  className?: string
  id?: string
}

/** Headline rendered as intentional lines (no accidental widows). */
export function SplitHeadline({ lines, as: Tag = 'h2', className = 'display display--l', id }: Props) {
  return (
    <Tag className={className} id={id}>
      {lines.map((l) => (
        <span className="line" key={l}>
          {l}
        </span>
      ))}
    </Tag>
  )
}
