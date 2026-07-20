import os, re

BASE = '/Users/navjotsinghhundal/Desktop/Devanhaar-main'

# ---- Fix app/page.tsx ----
p = os.path.join(BASE, 'app', 'page.tsx')
with open(p, 'r') as f:
    c = f.read()

c = c.replace('import { PartnershipBanner } from "@/components/partnership-banner"', '// PartnershipBanner removed per content update')
c = c.replace('<PartnershipBanner />', '{/* Partnership banner removed per content update */}')
c = c.replace('Our mission is to create, develop and empower.', 'Our mission is to develop, empower, elevate and connect.')

if 'PillarsSection' not in c:
    c = c.replace('import { LogoTicker } from "@/components/logo-ticker"', 'import { LogoTicker } from "@/components/logo-ticker"\nimport { PillarsSection } from "@/components/pillars-section"')
    c = c.replace('<LogoTicker />\n      <TestimonialsSection />', '<LogoTicker />\n      <PillarsSection />\n      <TestimonialsSection />')

with open(p, 'w') as f:
    f.write(c)
print('page.tsx updated')

# ---- Fix platform-section.tsx ----
p = os.path.join(BASE, 'components', 'platform-section.tsx')
with open(p, 'r') as f:
    c = f.read()

c = c.replace('import { Users, Heart, Globe, BookOpen, Star, GraduationCap, School } from "lucide-react"', 'import { Users, Heart, Globe, BookOpen, Star, GraduationCap, School, Shield } from "lucide-react"')
c = c.replace('OUR APPROACH TO COMMUNITY BUILDING', 'OUR APPROACH$TOGROWTH')
c = c.replace('A brotherhood camp uniquely designed for every Sikh at any stage of their spiritual journey. Brotherhood, growth, and deeper connection with Maharaaj.', "The UK's first retreat exclusively for Singhs, established in 2020, welcoming Sikhs at every stage of their spiritual journey.")
c = c.replace("An everlasting sisterhood with the aim of connecting to Sikhi and the Guru's Sangat. Spirituality, self-reflection and lifelong bonds.", "An everlasting sisterhood, grounded in a yearly retreat, with the aim of connecting sangat to spiritual growth, shared learning, and a supportive community.")
c = c.replace('Instilling Sikhi values in the next generation through interactive sessions, arts, sports, Kirtan classes and Sikh history.', 'Bespoke camps around the UK that are tailored to engage with youth in an interactive, fun and rememberable way.')

old_desc = 'Devanhaar is dedicated to inspiring individuals and\n                    communities on their Sikhi journey. Through camps, education,\n                    and leadership programmes, we build lasting bonds and deeper\n                    spiritual connections.'
new_desc = 'Devanhaar is dedicated to inspiring individuals on their\n                    spiritual journey. We take a holistic approach to engage\n                    members at every stage of life, offering guidance, learning\n                    opportunities, and community support to nurture personal\n                    growth, development, and connection to Sikh values.'
c = c.replace(old_desc, new_desc)

if 'Self Defence Academy' not in c:
    old_end = '    icon: <School className="w-5 h-5" />,\n    href: "/initiatives/gurmat-academy",\n  },\n]'
    new_end = '    icon: <School className="w-5 h-5" />,\n    href: "/initiatives/gurmat-academy",\n  },\n  {\n    title: "Self Defence Academy",\n    description:\n      "An academy dedicated to nurturing strength, skill and confidence whilst being rooted in Sikh values of honour, integrity and discipline.",\n    icon: <Shield className="w-5 h-5" />,\n    href: "/initiatives/self-defence-academy",\n  },\n]'
    c = c.replace(old_end, new_end)

with open(p, 'w') as f:
    f.write(c)
print('platform-section.tsx updated')

# ---- Fix projects-section.tsx ----
p = os.path.join(BASE, 'components', 'projects-section.tsx')
with open(p, 'r') as f:
    c = f.read()

c = c.replace('metric: "500+",\n    metricLabel: "Students annually",\n    fee: "500+",', 'metric: "1,000+",\n    metricLabel: "Students annually",\n    fee: "1,000+",')

with open(p, 'w') as f:
    f.write(c)
print('projects-section.tsx updated')

print('\nAll files updated on disk!')
