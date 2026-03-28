"use client";

import { useState } from "react";
import { InitiativePageLayout } from "@/components/initiative-page-layout";
import { CampApplicationForm } from "@/components/camp-application-form";

export function SinghsCampContent() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <InitiativePageLayout
        title="Singhs Camp"
        tagline="A residential camp experience for young Singhs"
        heroImage="/initiatives/singhs-camp-top.jpg"
        ctaText="Apply Now"
        onCtaClick={() => setShowForm(true)}
        description={[
          "Singhs Camp is a unique residential experience designed to bring young Singhs together in an environment of learning, growth, and community.",
          "Through workshops, discussions, and activities, participants deepen their connection to Sikhi while building lasting friendships.",
        ]}
        highlights={[
          {
            title: "Immersive Learning",
            description: "Engage in workshops covering Sikh history, philosophy, and practical Sikhi.",
          },
          {
            title: "Community Building",
            description: "Connect with like-minded individuals and form bonds that last a lifetime.",
          },
          {
            title: "Personal Growth",
            description: "Develop leadership skills and gain confidence in your identity.",
          },
        ]}
        videoTestimonials={[
          {
            videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/403de72803f34432a984103f67da664a/403de72803f34432a984103f67da664a.HD-1080p-2.5Mbps-35892452.mp4?v=0",
            caption: "“A spontaneous decision turned into the highlight of my year!” Ajay Singh from Glasgow shares his experience.",
          },
          {
            videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/c51ad5ab73d040078ccd9db3f22ccb8e/c51ad5ab73d040078ccd9db3f22ccb8e.HD-1080p-2.5Mbps-35892682.mp4?v=0",
            caption: "Onkar Singh’s journey at Singhs Camp is a testament to transformation.",
          },
          {
            videoUrl: "https://www.devanhaar.com/cdn/shop/videos/c/vp/b6f2e5058efb4b57b6e099039a2a90b2/b6f2e5058efb4b57b6e099039a2a90b2.HD-1080p-2.5Mbps-35892846.mp4?v=0",
            caption: "Dhiren Singh shares his vibrant journey at Singhs Camp.",
          },
        ]}
        faqs={[
          {
            question: "Who can attend Singhs Camp?",
            answer: "Singhs Camp is open to young Singhs aged 16 and over.",
          },
          {
            question: "What should I bring?",
            answer: "A full kit list will be provided upon registration.",
          },
        ]}
        galleryImages={[
          "/initiatives/singhs-camp-1.jpg",
          "/initiatives/singhs-camp-2.jpg",
          "/initiatives/singhs-camp-3.jpg",
        ]}
      />
      {showForm && (
        <CampApplicationForm
          initiativeSlug="singhs-camp"
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
