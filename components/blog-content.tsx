"use client"

function inlineMarkup(value: string) {
  return value.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-black">$1</strong>')
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
      elements.push(<h2 key={key++} className="mt-14 mb-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-black md:text-5xl">{line.slice(3)}</h2>)
      i++; continue
    }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} className="mt-10 mb-4 text-2xl font-semibold leading-tight tracking-[-0.025em] text-black md:text-3xl">{line.slice(4)}</h3>)
      i++; continue
    }

    if (line.startsWith("> ")) {
      elements.push(<blockquote key={key++} className="my-10 border-l-4 border-black pl-6 text-2xl font-medium leading-relaxed tracking-[-0.02em] text-black/80">{line.slice(2)}</blockquote>)
      i++; continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) { items.push(lines[i].slice(2)); i++ }
      elements.push(
        <ul key={key++} className="my-7 list-disc space-y-3 pl-6 text-lg leading-8 text-black/75">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineMarkup(item) }} />)}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++ }
      elements.push(
        <ol key={key++} className="my-7 list-decimal space-y-3 pl-6 text-lg leading-8 text-black/75">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineMarkup(item) }} />)}
        </ol>
      )
      continue
    }

    elements.push(<p key={key++} className="my-6 text-lg leading-8 text-black/75" dangerouslySetInnerHTML={{ __html: inlineMarkup(line) }} />)
    i++
  }

  return <div>{elements}</div>
}
