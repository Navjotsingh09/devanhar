const coverImages: Record<string, string> = {
  "sikhi-vidyala-launches-new-curriculum": "/initiatives/sikhi-vidyala-top.jpg",
  "over-1000-hours-of-workshops-delivered": "/initiatives/gurmat-academy-top.jpg",
  "university-talks-programme-expands": "/initiatives/roots-top.jpg",
  "mentorship-programme-connects-generations": "/initiatives/kaurs-camp-top.jpg",
  "singhs-camp-2026-registrations-open": "/initiatives/singhs-camp-top.jpg",
  "400-youth-empowered-through-devanhaar": "/initiatives/kids-camps-top.jpg",
  "50-events-annually-building-sangat": "/initiatives/sikh-padel-association-top.jpg",
  "devanhaar-community-network-launches": "/initiatives/sikh-family-retreat-top.png",
}

export function getBlogCoverImage(slug: string) {
  return coverImages[slug] || "/initiatives/roots-top.jpg"
}

export const blogAuthor = {
  name: "Devanhaar",
  role: "Community & Editorial Team",
}
