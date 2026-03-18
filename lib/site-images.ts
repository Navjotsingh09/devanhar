export interface SiteImage {
  id: string
  section: string
  category: string | null
  label: string | null
  alt_text: string | null
  url: string
  storage_path: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface PageSection {
  value: string
  label: string
  dbSection: string
  dbCategory: string | null
  defaultLabel?: string
  description?: string
  dimensions?: string
}

export interface SitePage {
  label: string
  sections: PageSection[]
}

export const SITE_PAGES: Record<string, SitePage> = {
  home: {
    label: "Home Page",
    sections: [
      { value: "hero-home", label: "Hero Banner", dbSection: "hero", dbCategory: "home", dimensions: "1920 × 1080px (16:9)", description: "Background image for the homepage hero area" },
    ],
  },
  about: {
    label: "About Page",
    sections: [
      { value: "hero-about", label: "Hero Image", dbSection: "hero", dbCategory: "about", dimensions: "1600 × 1200px (4:3)", description: "Main hero image on the about page header" },
      { value: "about-purpose", label: "Purpose Section Image", dbSection: "about", dbCategory: "purpose", dimensions: "1600 × 1200px (4:3)", description: "Image for the Purpose / What We Do section" },
      { value: "about-people", label: "Our People Section Image", dbSection: "about", dbCategory: "people", dimensions: "1600 × 1200px (4:3)", description: "Image for the Our People section" },
      { value: "about-story-2018", label: "Our Story — 2018", dbSection: "about", dbCategory: "story-2018", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2018 milestone" },
      { value: "about-story-2019", label: "Our Story — 2019", dbSection: "about", dbCategory: "story-2019", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2019 milestone" },
      { value: "about-story-2020", label: "Our Story — 2020", dbSection: "about", dbCategory: "story-2020", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2020 milestone" },
      { value: "about-story-2021", label: "Our Story — 2021", dbSection: "about", dbCategory: "story-2021", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2021 milestone" },
      { value: "about-story-2022", label: "Our Story — 2022", dbSection: "about", dbCategory: "story-2022", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2022 milestone" },
      { value: "about-story-2023", label: "Our Story — 2023", dbSection: "about", dbCategory: "story-2023", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2023 milestone" },
      { value: "about-story-2024", label: "Our Story — 2024", dbSection: "about", dbCategory: "story-2024", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2024 milestone" },
      { value: "about-story-2025", label: "Our Story — 2025", dbSection: "about", dbCategory: "story-2025", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2025 milestone" },
      { value: "about-story-2026", label: "Our Story — 2026", dbSection: "about", dbCategory: "story-2026", dimensions: "1920 × 1080px (16:9)", description: "Background for the 2026 milestone" },
    ],
  },
  team: {
    label: "Team Page",
    sections: [
      { value: "hero-team", label: "Hero Image", dbSection: "hero", dbCategory: "team", dimensions: "1600 × 1200px (4:3)", description: "Hero image on the team page header" },
      { value: "team-leadership", label: "Leadership Photos", dbSection: "team", dbCategory: "leadership", description: "Use the Label field for the person's name", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "team-members", label: "Team Member Photos", dbSection: "team", dbCategory: "team", description: "Use the Label field for the person's name", dimensions: "800 × 800px (1:1 square)" },
    ],
  },
  foundation: {
    label: "Our Foundation",
    sections: [
      { value: "hero-foundation", label: "Hero Image", dbSection: "hero", dbCategory: "foundation", dimensions: "1600 × 1200px (4:3)", description: "Hero image on the foundation page header" },
      { value: "foundation-mission", label: "Mission Section Image", dbSection: "foundation", dbCategory: "mission", dimensions: "1600 × 1200px (4:3)", description: "Image for the mission / Ik Onkar section" },
      { value: "timeline-2017", label: "Timeline — 2017", dbSection: "timeline", dbCategory: "2017", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2018", label: "Timeline — 2018", dbSection: "timeline", dbCategory: "2018", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2019", label: "Timeline — 2019", dbSection: "timeline", dbCategory: "2019", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2020", label: "Timeline — 2020", dbSection: "timeline", dbCategory: "2020", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2021", label: "Timeline — 2021", dbSection: "timeline", dbCategory: "2021", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2022", label: "Timeline — 2022", dbSection: "timeline", dbCategory: "2022", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2023", label: "Timeline — 2023", dbSection: "timeline", dbCategory: "2023", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2024", label: "Timeline — 2024", dbSection: "timeline", dbCategory: "2024", dimensions: "1200 × 750px (16:10)" },
    ],
  },
  projects: {
    label: "Projects Page",
    sections: [
      { value: "hero-projects", label: "Hero Image", dbSection: "hero", dbCategory: "projects", dimensions: "1600 × 1200px (4:3)", description: "Hero image on the projects page header" },
      { value: "project-card-singhs-camp", label: "Card — Singhs Camp", dbSection: "projects", dbCategory: "singhs-camp", dimensions: "2100 × 900px (21:9)", description: "Featured project banner" },
      { value: "project-card-kaurs-camp", label: "Card — Kaurs Camp", dbSection: "projects", dbCategory: "kaurs-camp", dimensions: "1600 × 1000px (16:10)" },
      { value: "project-card-kids-camps", label: "Card — Kids Camps", dbSection: "projects", dbCategory: "kids-camps", dimensions: "1600 × 1000px (16:10)" },
      { value: "project-card-sikhi-vidyala", label: "Card — Sikhi Vidyala", dbSection: "projects", dbCategory: "sikhi-vidyala", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "project-card-khalsa-catalyst", label: "Card — Khalsa Catalyst", dbSection: "projects", dbCategory: "khalsa-catalyst", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "project-card-university-projects", label: "Card — University Projects", dbSection: "projects", dbCategory: "university-projects", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "project-card-gurmat-academy", label: "Card — Gurmat Academy", dbSection: "projects", dbCategory: "gurmat-academy", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "project-card-self-defence-academy", label: "Card — Self Defence Academy", dbSection: "projects", dbCategory: "self-defence-academy", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "project-card-spn", label: "Card — Sikh Professional Network", dbSection: "projects", dbCategory: "spn", dimensions: "900 × 1200px (3:4 portrait)" },
    ],
  },
  media: {
    label: "Media Page",
    sections: [
      { value: "gallery-camps", label: "Gallery — Camps", dbSection: "gallery", dbCategory: "camps", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-events", label: "Gallery — Events", dbSection: "gallery", dbCategory: "events", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-education", label: "Gallery — Education", dbSection: "gallery", dbCategory: "education", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-community", label: "Gallery — Community", dbSection: "gallery", dbCategory: "community", dimensions: "1200px min width (mixed aspect ratios)" },
    ],
  },
  "singhs-camp": {
    label: "Singhs Camp",
    sections: [
      { value: "singhs-camp-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "singhs-camp", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "singhs-camp-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "singhs-camp", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "kaurs-camp": {
    label: "Kaurs Camp",
    sections: [
      { value: "kaurs-camp-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "kaurs-camp", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "kaurs-camp-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "kaurs-camp", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "kids-camps": {
    label: "Kids Camps",
    sections: [
      { value: "kids-camps-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "kids-camps", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "kids-camps-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "kids-camps", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "sikhi-vidyala": {
    label: "Sikhi Vidyala",
    sections: [
      { value: "sikhi-vidyala-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "sikhi-vidyala", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "sikhi-vidyala-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "sikhi-vidyala", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "khalsa-catalyst": {
    label: "Khalsa Catalyst",
    sections: [
      { value: "khalsa-catalyst-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "khalsa-catalyst", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "khalsa-catalyst-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "khalsa-catalyst", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "university-projects": {
    label: "University Projects",
    sections: [
      { value: "university-projects-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "university-projects", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "university-projects-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "university-projects", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "gurmat-academy": {
    label: "Gurmat Academy",
    sections: [
      { value: "gurmat-academy-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "gurmat-academy", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "gurmat-academy-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "gurmat-academy", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "self-defence-academy": {
    label: "Self Defence Academy",
    sections: [
      { value: "self-defence-academy-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "self-defence-academy", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "self-defence-academy-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "self-defence-academy", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "sikh-professional-network": {
    label: "Sikh Professional Network",
    sections: [
      { value: "sikh-professional-network-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "sikh-professional-network", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "sikh-professional-network-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "sikh-professional-network", dimensions: "1200 × 900px (4:3)" },
    ],
  },
}
