"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
}

const leadership: TeamMember[] = [
  {
    name: "Harjinder Singh",
    role: "Founder & Chairperson",
    bio: "A visionary leader dedicated to community empowerment through education and service.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Harjinder",
  },
  {
    name: "Gurpreet Kaur",
    role: "Director of Education",
    bio: "With over a decade in educational programme design, Gurpreet leads our learning initiatives.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Gurpreet",
  },
  {
    name: "Rajveer Singh",
    role: "Head of Operations",
    bio: "Rajveer ensures every project runs smoothly from conception to delivery.",
    image: "https://api.dicebear.com/9.x/notionists/svg?seed=Rajveer",
  },
]
