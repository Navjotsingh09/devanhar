"use client"

export function BlogContent({ content }: { content: string }) {
  const lines = content.split("\\n")
  const elements: React.ReactNode[] = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      i++
      continue
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-foreground mt-10 mb-4">
          {line.slice(3)}
        </h2>
      )
      i++
      continue
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {line.slice(4)}
        </h3>
      )
      i++
      continue
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-6">
          {line.slice(2)}
        </blockquote>
      )
      i++
      continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2">
          {items.map((item, j) => (
            <li
              key={j}
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                ),
              }}
            />
          ))}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={key++} className="list-decimal pl-6 my-4 space-y-2">
          {items.map((item, j) => (
            <li
              key={j}
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                ),
              }}
            />
          ))}
        </ol>
      )
      continue
    }

    elements.push(
      <p
        key={key++}
        className="text-foreground leading-relaxed my-4"
        dangerouslySetInnerHTML={{
          __html: line.replace(
            /\*\*(.+?)\*\*/g,
            '<strong class="font-semibold">$1</strong>'
          ),
        }}
      />
    )
    i++
  }

  return <div className="prose-devanhaar">{elements}</div>
}
