import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import vm from "node:vm"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import postcss from "postcss"

const require = createRequire(import.meta.url)
function load(path, modules = {}) {
  const module = { exports: {} }
  const result = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    reportDiagnostics: true,
  })
  assert.equal(result.diagnostics.length, 0)
  vm.runInNewContext(result.outputText, {
    module,
    exports: module.exports,
    require: name => name in modules ? modules[name] : require(name),
  })
  return module.exports
}

const { wrestlingContent } = load("lib/wrestling-content.ts")
function render(content = wrestlingContent) {
  const { WrestlingPage } = load("components/wrestling/wrestling-page.tsx", {
    "@/components/cms/native-page-sections":{NativePageSections:()=>null},
    "@/lib/cms/copy-node": {applyPageCopy:node=>node,registerCopyComponent:()=>{}},
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "next/image": ({ fill, priority, ...props }) => React.createElement("img", props),
    "@/components/navbar": { Navbar: () => React.createElement("header", null, "Site navigation") },
    "@/components/footer-section": { FooterSection: () => React.createElement("footer", null, "Existing contact form") },
    "@/components/scroll-animations": { ScrollAnimations: () => null },
    "@/lib/wrestling-content": { wrestlingContent: content },
    "./wrestling-page.css": {},
  })
  return renderToStaticMarkup(React.createElement(WrestlingPage))
}

test("preserves academy copy, heritage, navigation and existing footer", () => {
  const html = render()
  assert.equal((html.match(/<h1 /g) || []).length, 1)
  for (const text of [wrestlingContent.introduction, wrestlingContent.history, wrestlingContent.overview, wrestlingContent.organisation, ...wrestlingContent.heritage, wrestlingContent.heritageClosing]) {
    assert.ok(html.includes(renderToStaticMarkup(React.createElement("p", null, text)).slice(3, -4)), text)
  }
  assert.ok(html.includes("Existing contact form"))
  assert.ok(html.includes("Site navigation"))
  assert.ok(!html.includes("Timetable to be confirmed"))
  assert.ok(!html.includes("Photos and videos from the academy will be added here soon."))
  assert.ok(!html.includes("07507342465"))
})

test("shows confirmed schedule, fees, eligibility, location and kit without old placeholders", () => {
  const html = render()
  for (const text of [
    "Monday", "Wednesday", "7:00pm – 8:30pm", wrestlingContent.location,
    wrestlingContent.ageRange, wrestlingContent.experience, wrestlingContent.whatToBring,
    "Adults (16+)", "Under 16s", "£30 per month", "£5 per session", "£20 per month", "£3 per session",
  ]) {
    assert.ok(html.includes(renderToStaticMarkup(React.createElement("p", null, text)).slice(3, -4)), text)
  }
  assert.equal(wrestlingContent.media.length, 10)
  assert.ok(!html.includes("/initiatives/self-defence-top.png"))
  for (const item of wrestlingContent.media) assert.ok(fs.existsSync(`public${item.src}`), item.src)
  for (const asset of ["logo", "banner", "heritage", "class-poster", "team-01"]) {
    assert.ok(html.includes(`/wrestling/${asset}.webp`), asset)
  }
})

test("retains empty timetable and media states when no details have been supplied", () => {
  const html = render({ ...wrestlingContent, sessions: [], media: [] })
  assert.ok(html.includes("Timetable to be confirmed"))
  assert.ok(html.includes("Photos and videos from the academy will be added here soon."))
})

test("section navigation resolves and enquiry links keep the existing contact destination", () => {
  const html = render()
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(html.includes(`id="${anchor}"`), `Missing section: ${anchor}`)
  }
  const destinations = [...html.matchAll(/<a\b[^>]*href="([^"#][^"]*)"/g)].map(match => match[1])
  assert.ok(destinations.length >= 4)
  assert.ok(destinations.every(href => href === "/contact"))
})

test("renders supplied timetable and image/video media instead of empty states", () => {
  const html = render({
    ...wrestlingContent,
    sessions: [{ day: "Test day", time: "Test time", venue: "Test venue", group: "Test group" }],
    media: [
      { src: "/test-photo.jpg", alt: "Test academy photo", caption: "Photo caption", type: "image" },
      { src: "/test-video.mp4", alt: "Test academy video", caption: "Video caption", type: "video" },
    ],
  })
  for (const value of ["Test day", "Test time", "Test venue", "Test group", "Photo caption", "Video caption"]) {
    assert.ok(html.includes(value))
  }
  assert.ok(html.includes('alt="Test academy photo"'))
  assert.match(html, /<video[^>]*aria-label="Test academy video"[^>]*controls=""/)
  assert.ok(html.includes('scope="col"'))
  assert.ok(!html.includes("Timetable to be confirmed"))
  assert.ok(!html.includes("Photos and videos from the academy will be added here soon."))
})

test("all styles are scoped to Wrestling, with mobile layout and visible focus states", () => {
  const css = fs.readFileSync("components/wrestling/wrestling-page.css", "utf8")
  const root = postcss.parse(css)
  root.walkRules(rule => {
    for (const selector of rule.selectors) {
      assert.ok(selector === ".wrestling-page" || selector.startsWith(".wrestling-page "), `Unscoped selector: ${selector}`)
    }
  })
  assert.ok(css.includes("@media (max-width: 700px)"))
  assert.ok(css.includes(":focus-visible"))
})

test("all public replacement routes still use the same Wrestling component", () => {
  assert.ok(fs.readFileSync("app/wrestling/page.tsx", "utf8").includes("WrestlingPage"))
  for (const path of [
    "app/initiatives/wrestling-academy/page.tsx",
    "app/initiatives/self-defence-academy/page.tsx",
  ]) {
    assert.match(fs.readFileSync(path, "utf8"), /wrestling\/page/, path)
  }
  for (const path of ["app/sda/page.tsx", "app/self-defence-academy/page.tsx"]) {
    assert.match(fs.readFileSync(path, "utf8"), /self-defence-academy\/page/)
  }
})

test("gallery photos fill uniform 4:3 tiles without portrait letterboxing", () => {
  const root = postcss.parse(fs.readFileSync("components/wrestling/wrestling-page.css", "utf8"))
  const styles = {}
  root.walkRules(rule => {
    if (rule.selectors.includes(".wrestling-page .wrestling-media-image img")) {
      rule.walkDecls(declaration => { styles[declaration.prop] = declaration.value })
    }
    if (rule.selectors.includes(".wrestling-page .wrestling-media-image")) {
      assert.ok(rule.nodes.some(node => node.prop === "aspect-ratio" && node.value === "4 / 3"))
    }
  })
  assert.equal(styles["object-fit"], "cover")
  assert.equal(styles["aspect-ratio"], "4 / 3")
})
