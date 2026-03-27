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
