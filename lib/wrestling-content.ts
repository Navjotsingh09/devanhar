export type WrestlingSession = { day: string; time: string; venue: string; group: string }
export type WrestlingMedia = { src: string; alt: string; caption: string; type: "image" | "video" }

export const wrestlingContent = {
  title: "Devanhaar Wrestling Academy",
  tagline: "Strong body. Strong Mind. Strong Sangat.",
  introduction: "Devanhaar Wrestling Academy is a community-led initiative dedicated to promoting freestyle wrestling while reconnecting the next generation with the rich wrestling heritage of the Sikh and Punjabi community.",
  history: "Wrestling has deep roots in Sikh history. From Guru Angad Dev Ji's promotion of physical training and wrestling akharas to Guru Hargobind Sahib Ji's emphasis on the Sant-Sipahi (Saint-Soldier) ideal, physical strength, discipline and resilience have long been valued alongside spiritual development.",
  overview: "The academy aims to carry this tradition forward by providing an accessible, supportive and challenging environment where individuals can develop their wrestling abilities, improve their physical and mental wellbeing, and build lasting connections within the sangat.",
  organisation: "The initiative forms part of the wider Devanhaar organisation.",
  heritage: [
    "The human body is a precious gift, and maintaining its health and strength allows us to better fulfil our responsibilities, serve others and progress on our spiritual journey.",
    "Physical strength is not an end in itself, but a means to a greater purpose. A healthy, disciplined body can become an instrument for seva, simran, and living a life guided by Gurmat.",
    "This understanding is reflected in the legacy of Sri Guru Angad Dev Ji, who encouraged physical exercise and established wrestling akharas, recognising the importance of developing both physical and mental strength.",
    "This tradition continued through Sri Guru Hargobind Sahib Ji, whose Miri-Piri principle embodied the balance between spiritual and worldly responsibilities.",
    "At Devanhaar Wrestling Academy, we aim to carry forward these principles. Through wrestling, we encourage individuals to develop strength, discipline, humility, and resilience - not simply to become better athletes, but to become better equipped to serve their families, their sangat, and the wider community.",
  ],
  heritageClosing: "A strong body in service of a higher purpose.",
  location: "Edward Street Gurdwara - Old Darbar Hall, B70 8NN",
  ageRange: "Classes are primarily aimed at ages 15+. Younger wrestlers with sufficient experience may also attend where training alongside the older group is appropriate for their development.",
  experience: "Beginners and experienced wrestlers are welcome.",
  whatToBring: "Comfortable training clothes, a spare T-shirt, towel, water bottle and a positive attitude.",
  membership: [
    { group: "Adults (16+)", monthly: "£30 per month", session: "£5 per session" },
    { group: "Under 16s", monthly: "£20 per month", session: "£3 per session" },
  ],
  sessions: ["Monday", "Wednesday"].map(day => ({
    day,
    time: "7:00pm – 8:30pm",
    venue: "Edward Street Gurdwara - Old Darbar Hall, B70 8NN",
    group: "Primarily ages 15+",
  })) satisfies WrestlingSession[],
  media: [
    { src: "/wrestling/team-01.webp", alt: "Devanhaar Wrestling Academy group on the training mats", caption: "Our academy sangat.", type: "image" },
    { src: "/wrestling/team-02.webp", alt: "Academy wrestlers posing together after training", caption: "Building connections through wrestling.", type: "image" },
    { src: "/wrestling/training-01.webp", alt: "Wrestlers demonstrating a standing technique to the class", caption: "Learning together on the mat.", type: "image" },
    { src: "/wrestling/training-02.webp", alt: "Two wrestlers practising a standing technique as the class watches", caption: "Developing freestyle wrestling technique.", type: "image" },
    { src: "/wrestling/training-03.webp", alt: "Wrestlers practising a takedown during an academy session", caption: "Strength, discipline and resilience.", type: "image" },
    { src: "/wrestling/training-04.webp", alt: "Wrestlers demonstrating groundwork on the academy mats", caption: "Developing control on the mat.", type: "image" },
    { src: "/wrestling/training-05.webp", alt: "Close view of two wrestlers practising a standing hold", caption: "Practising technique together.", type: "image" },
    { src: "/wrestling/training-06.webp", alt: "Two academy wrestlers practising a groundwork hold", caption: "Learning through practice.", type: "image" },
    { src: "/wrestling/class.webp", alt: "Academy participants gathered around the training mats", caption: "Strong body. Strong Mind. Strong Sangat.", type: "image" },
    { src: "/wrestling/team-03.webp", alt: "Devanhaar wrestlers gathered for an academy group photograph", caption: "Our wrestling community.", type: "image" },
  ] as WrestlingMedia[],
}
