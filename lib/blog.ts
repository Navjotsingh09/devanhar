export type Pillar = "Develop" | "Elevate" | "Empower" | "Connect"

export interface BlogPost {
  slug: string
  title: string
  description: string
  pillar: Pillar
  source?: string
  date: string
  readTime: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "sikhi-vidyala-launches-new-curriculum",
    title: "Sikhi Vidyala Launches New Curriculum for 2026",
    description: "Our Gurmat academy introduces an expanded syllabus covering Sikh history, Gurmukhi literacy, and Kirtan training.",
    pillar: "Develop",
    date: "2026-02-15",
    readTime: "4 min",
    content: "## A New Chapter for Sikhi Vidyala\\n\\nSikhi Vidyala has unveiled a brand-new curriculum for 2026.\\n\\n### 1. Sikh History & Philosophy\\nStudents explore the lives of the Guru Sahibaan and key historical events.\\n\\n### 2. Gurmukhi Literacy\\nFrom beginner-level letter recognition to advanced Gurbani reading.\\n\\n### 3. Kirtan & Sangeet\\nTeaching both Raag-based and contemporary Kirtan styles.\\n\\n### Enrolment\\nSikhi Vidyala runs on weekends across multiple UK cities.\\n\\n> Education is the foundation of everything we do at Devanhaar.",
  },
  {
    slug: "over-1000-hours-of-workshops-delivered",
    title: "Over 1,000 Hours of Workshops Delivered",
    description: "Devanhaar reaches a major milestone with more than 1,000 hours of educational workshops delivered across the UK.",
    pillar: "Develop",
    date: "2026-01-20",
    readTime: "3 min",
    content: "## 1,000+ Hours and Counting\\n\\nDevanhaar has now delivered over 1,000 hours of workshops across the United Kingdom.\\n\\n### What Our Workshops Cover\\n- **Leadership & Public Speaking**\\n- **Mental Health & Well-being**\\n- **Sikh Heritage & Identity**\\n- **Career Development**\\n\\n### The Impact\\nFeedback consistently highlights increased confidence and practical skills.",
  },
  {
    slug: "university-talks-programme-expands",
    title: "University Talks Programme Expands to 15 Campuses",
    description: "Devanhaar's university outreach now reaches 15 campuses across the UK with talks on Sikh identity and career development.",
    pillar: "Elevate",
    date: "2026-03-01",
    readTime: "3 min",
    content: "## Elevating Futures on Campus\\n\\nOur university talks programme has expanded to 15 campuses.\\n\\n### Topics Covered\\n- **Sikh Identity in Professional Settings**\\n- **Mental Health**\\n- **Career Pathways**\\n- **Community & Seva**\\n\\n### Partner Universities\\nWe work with Sikh Societies at UCL, King's College London, University of Birmingham, and many more.",
  },
  {
    slug: "mentorship-programme-connects-generations",
    title: "Mentorship Programme Connects Generations of Sikhs",
    description: "Our mentorship scheme pairs young Sikhs with experienced professionals for guidance on careers, faith, and personal growth.",
    pillar: "Elevate",
    date: "2026-02-10",
    readTime: "4 min",
    content: "## Bridging Generations Through Mentorship\\n\\nThe programme pairs aspiring young Sikhs with established professionals.\\n\\n### How It Works\\n1. **Application** \u2014 mentees share their goals\\n2. **Matching** \u2014 paired based on career sector\\n3. **Sessions** \u2014 monthly meetings\\n4. **Community** \u2014 private group for peer support\\n\\n> Having a mentor who understands my faith and my professional world has been transformative.",
  },
  {
    slug: "singhs-camp-2026-registrations-open",
    title: "Singhs Camp UK 2026: Registrations Now Open",
    description: "Our flagship residential camp returns for 2026 with workshops, Kirtan, sport, and community building.",
    pillar: "Empower",
    date: "2026-03-10",
    readTime: "5 min",
    content: "## Singhs Camp UK Returns\\n\\nSinghs Camp UK is back for 2026. Young Sikhs aged 16-30 come together for an immersive programme.\\n\\n### What to Expect\\n- **Interactive Workshops**\\n- **Kirtan & Simran**\\n- **Sports & Outdoor Activities**\\n- **Late Night Diwans**\\n- **Langar & Community**\\n\\n> Singhs Camp UK changed my life. I found my Sangat and made lifelong friends.",
  },
  {
    slug: "400-youth-empowered-through-devanhaar",
    title: "400+ Youth Empowered Through Devanhaar Programmes",
    description: "Devanhaar celebrates empowering over 400 young Sikhs through camps, workshops, and leadership initiatives.",
    pillar: "Empower",
    date: "2026-01-05",
    readTime: "3 min",
    content: "## Empowering 400+ Young Sikhs\\n\\nDevanhaar has directly empowered over 400 young Sikhs.\\n\\n### Where the Impact Happens\\n- **Singhs Camp UK** \u2014 residential weekends\\n- **Sikhi Vidyala** \u2014 regular academy sessions\\n- **University Talks** \u2014 reaching students UK-wide\\n- **Community Events** \u2014 Nagar Kirtans and gatherings\\n\\n### Measuring Impact\\n- 94% report increased confidence in their Sikh identity\\n- 89% developed practical skills\\n- 91% feel more connected to the Sikh community",
  },
  {
    slug: "50-events-annually-building-sangat",
    title: "50+ Events Annually: Building Sangat Across the UK",
    description: "From Nagar Kirtans to networking evenings, Devanhaar runs over 50 events each year creating spaces for young Sikhs to connect.",
    pillar: "Connect",
    date: "2026-02-28",
    readTime: "3 min",
    content: "## Connecting Through Events\\n\\nDevanhaar organises over 50 events annually.\\n\\n### Event Types\\n- **Nagar Kirtans** \u2014 community processions\\n- **Networking Evenings** \u2014 professional meetups\\n- **Sports Tournaments** \u2014 kabaddi, football, basketball\\n- **Charity Fundraisers**\\n- **Social Meetups**\\n\\n### Why Events Matter\\nIn-person connection is more valuable than ever.\\n\\n### Get Involved\\nCheck our events page for upcoming events near you.",
  },
  {
    slug: "devanhaar-community-network-launches",
    title: "Devanhaar Community Network Launches Online",
    description: "A new online platform connecting Devanhaar alumni and volunteers, enabling ongoing collaboration and peer support.",
    pillar: "Connect",
    date: "2026-01-15",
    readTime: "3 min",
    content: "## Staying Connected Between Events\\n\\nThe Devanhaar Community Network is an online space for alumni and supporters.\\n\\n### Features\\n- **Discussion Groups** \u2014 organised by pillar\\n- **Event Planning** \u2014 collaborate on local meetups\\n- **Resource Library** \u2014 past workshop recordings\\n- **Mentorship Matching**\\n\\n### Who Can Join\\nOpen to anyone who has attended a Devanhaar event, volunteered, or donated.\\n\\nJoin the network today through your Devanhaar dashboard.",
  },
]

export function getPostsByPillar(pillar: Pillar): BlogPost[] {
  return blogPosts.filter((p) => p.pillar === pillar)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug)
}
