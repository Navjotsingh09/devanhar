"use client"

import type { ReactNode } from "react"

function isSafeHref(value: string) {
  try {
    const url = new URL(value, "https://devanhaar.com")
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
  } catch {
    return false
  }
}

function inlineMarkup(value: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let key = 0

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) nodes.push(value.slice(lastIndex, index))

    const token = match[0]

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-black">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key++} className="italic text-black/85">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const [, label, href] = linkMatch
        if (isSafeHref(href)) {
          nodes.push(
            <a
              key={key++}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="font-medium text-black underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black"
            >
              {label}
            </a>
          )
        } else {
          nodes.push(label)
        }
      }
    }

    lastIndex = index + token.length
  }

  if (lastIndex < value.length) nodes.push(value.slice(lastIndex))
  return nodes
}

export function BlogContent({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "") { i++; continue }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-14 mb-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-black md:text-5xl">
          {inlineMarkup(line.slice(3))}
        </h2>
      )
      i++; continue
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-10 mb-4 text-2xl font-semibold leading-tight tracking-[-0.025em] text-black md:text-3xl">
          {inlineMarkup(line.slice(4))}
        </h3>
      )
      i++; continue
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="my-10 border-l-4 border-black pl-6 text-2xl font-medium leading-relaxed tracking-[-0.02em] text-black/80">
          {inlineMarkup(line.slice(2))}
        </blockquote>
      )
      i++; continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) { items.push(lines[i].slice(2)); i++ }
      elements.push(
        <ul key={key++} className="my-7 list-disc space-y-3 pl-6 text-lg leading-8 text-black/75">
          {items.map((item, j) => <li key={j}>{inlineMarkup(item)}</li>)}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++ }
      elements.push(
        <ol key={key++} className="my-7 list-decimal space-y-3 pl-6 text-lg leading-8 text-black/75">
          {items.map((item, j) => <li key={j}>{inlineMarkup(item)}</li>)}
        </ol>
      )
      continue
    }

    elements.push(
      <p key={key++} className="my-6 text-lg leading-8 text-black/75">
        {inlineMarkup(line)}
      </p>
    )
    i++
  }

  return <div>{elements}</div>
}
