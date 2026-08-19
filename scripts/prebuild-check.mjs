import { readFileSync, statSync } from "node:fs"
import { spawnSync } from "node:child_process"

const maxTrackedFileBytes = 95 * 1024 * 1024
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const escapedBang = String.fromCharCode(92, 33)
const projectSourceDirectory = /^(app|components|hooks|lib|scripts)\//

const result = spawnSync("/usr/bin/git", ["ls-files", "-co", "--exclude-standard", "-z"], {
  encoding: "utf8",
  env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null" },
})

if (result.status !== 0) {
  console.error("Prebuild check could not read the Git file list.")
  process.exit(1)
}

const files = result.stdout.split("\0").filter(Boolean)
const oversizedFiles = []
const escapedSourceFiles = []

for (const file of files) {
  let stats
  try {
    stats = statSync(file)
  } catch {
    continue
  }

  if (!stats.isFile()) continue
  if (stats.size >= maxTrackedFileBytes) {
    oversizedFiles.push(`${file} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)
  }

  const extension = file.slice(file.lastIndexOf(".")).toLowerCase()
  const isProjectSource = sourceExtensions.has(extension) && (!file.includes("/") || projectSourceDirectory.test(file))
  if (!isProjectSource) continue

  const source = readFileSync(file, "utf8")
  if (source.includes(escapedBang)) escapedSourceFiles.push(file)
}

if (oversizedFiles.length > 0 || escapedSourceFiles.length > 0) {
  console.error("Prebuild check failed:")

  if (oversizedFiles.length > 0) {
    console.error("Files are too large for GitHub/Vercel source control:")
    for (const file of oversizedFiles) console.error(`- ${file}`)
  }

  if (escapedSourceFiles.length > 0) {
    console.error("Source files contain a literal escaped exclamation mark:")
    for (const file of escapedSourceFiles) console.error(`- ${file}`)
    console.error("Use a normal exclamation mark in TypeScript/JavaScript source.")
  }

  process.exit(1)
}

console.log(`Prebuild check passed for ${files.length} tracked/unignored files.`)
