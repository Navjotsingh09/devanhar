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
      { value: "hero-home", label: "Hero Banner", dbSection: "hero", dbCategory: "home", dimensions: "1920 × 1080px (16:9)" },
    ],
  },
  about: {
    label: "About Page",
    sections: [
      { value: "hero-about", label: "Hero Image", dbSection: "hero", dbCategory: "about", dimensions: "1600 × 1200px (4:3)" },
    ],
  },
  team: {
    label: "Team Page",
    sections: [
      { value: "team-leadership", label: "Leadership Photos", dbSection: "team", dbCategory: "leadership", description: "Use the Label field for the person's name", dimensions: "900 × 1200px (3:4 portrait)" },
      { value: "team-members", label: "Team Member Photos", dbSection: "team", dbCategory: "team", description: "Use the Label field for the person's name", dimensions: "800 × 800px (1:1 square)" },
    ],
  },
  foundation: {
    label: "Foundation Page",
    sections: [
      { value: "hero-foundation", label: "Hero Image", dbSection: "hero", dbCategory: "foundation", dimensions: "1600 × 1200px (4:3)" },
      { value: "timeline-2017", label: "Timeline \u2014 2017", dbSection: "timeline", dbCategory: "2017", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2018", label: "Timeline \u2014 2018", dbSection: "timeline", dbCategory: "2018", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2019", label: "Timeline \u2014 2019", dbSection: "timeline", dbCategory: "2019", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2020", label: "Timeline \u2014 2020", dbSection: "timeline", dbCategory: "2020", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2021", label: "Timeline \u2014 2021", dbSection: "timeline", dbCategory: "2021", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2022", label: "Timeline \u2014 2022", dbSection: "timeline", dbCategory: "2022", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2023", label: "Timeline \u2014 2023", dbSection: "timeline", dbCategory: "2023", dimensions: "1200 × 750px (16:10)" },
      { value: "timeline-2024", label: "Timeline \u2014 2024", dbSection: "timeline", dbCategory: "2024", dimensions: "1200 × 750px (16:10)" },
    ],
  },
  media: {
    label: "Media Page",
    sections: [
      { value: "gallery-camps", label: "Gallery \u2014 Camps", dbSection: "gallery", dbCategory: "camps", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-events", label: "Gallery \u2014 Events", dbSection: "gallery", dbCategory: "events", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-education", label: "Gallery \u2014 Education", dbSection: "gallery", dbCategory: "education", dimensions: "1200px min width (mixed aspect ratios)" },
      { value: "gallery-community", label: "Gallery \u2014 Community", dbSection: "gallery", dbCategory: "community", dimensions: "1200px min width (mixed aspect ratios)" },
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
      { value: "uni-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "university-projects", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "uni-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "university-projects", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "gurmat-academy": {
    label: "Gurmat Academy",
    sections: [
      { value: "gurmat-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "gurmat-academy", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "gurmat-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "gurmat-academy", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "self-defence-academy": {
    label: "Self Defence Academy",
    sections: [
      { value: "sda-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "self-defence-academy", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "sda-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "self-defence-academy", dimensions: "1200 × 900px (4:3)" },
    ],
  },
  "sikh-professional-network": {
    label: "Sikh Professional Network",
    sections: [
      { value: "spn-hero", label: "Hero Image", dbSection: "initiative", dbCategory: "sikh-professional-network", defaultLabel: "hero", dimensions: "1600 × 1200px (4:3)" },
      { value: "spn-gallery", label: "Gallery", dbSection: "initiative", dbCategory: "sikh-professional-network", dimensions: "1200 × 900px (4:3)" },
    ],
  },
}
