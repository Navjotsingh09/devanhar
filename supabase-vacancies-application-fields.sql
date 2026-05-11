-- Migration: Vacancies application form fields (per-role config + extra applicant fields)
-- Run AFTER supabase-vacancies-extension.sql

-- 1. Per-vacancy application form configuration
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS application_config JSONB DEFAULT '{}'::jsonb;

-- 2. Extra applicant fields collected by the public form
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS right_to_work_uk BOOLEAN;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS has_filming_equipment BOOLEAN;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS can_travel_events BOOLEAN;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS can_attend_in_person BOOLEAN;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;
ALTER TABLE vacancy_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- 3. Backfill content for the two live vacancies
-- =============================================================================
-- Content Creator (Full-time)
-- =============================================================================
UPDATE vacancies SET
  title = 'Content Creator',
  vacancy_type = 'paid',
  employment_basis = 'full-time',
  location = 'Edgbaston, Birmingham',
  is_remote = false,
  salary_range = 'Negotiable (based on experience)',
  closes_at = '2026-05-31'::timestamptz,
  description = 'Devanhaar is seeking a creative, organised and passionate Content Creator to help capture, create and share compelling digital stories across our platforms: Instagram, TikTok, LinkedIn, Facebook and YouTube Shorts.

This role focuses on producing high-quality photo, video and social media content that reflects our mission, inspires our community, and amplifies our impact. The successful candidate will support campaigns, events, community storytelling, and platform growth through engaging creative content.',
  responsibilities = E'\u2022 Planning, creating, and executing social media content\n\u2022 Filming and editing short-form content (Reels, TikToks, Shorts)\n\u2022 Designing social graphics (Canva / Adobe)\n\u2022 Writing captions, hooks, and calls-to-action\n\u2022 Managing content calendars and scheduling posts\n\u2022 Monitoring comments, DMs, and engagement\n\u2022 Analysing performance and improving content strategy',
  requirements = E'\u2022 1\u20134 years experience in content creation\n\u2022 Experience managing multiple brands/accounts (agency experience preferred)\n\u2022 Filming content (phone/camera)\n\u2022 Editing short-form video\n\u2022 Designing posts (Canva / Adobe)\n\u2022 Ability to write engaging captions and hooks\n\u2022 Confident being on camera when required\n\u2022 Strong understanding of what makes content perform\n\u2022 Ability to analyse performance and adjust strategy',
  how_to_apply = NULL,
  is_active = true,
  application_config = '{
    "ask_dob": true,
    "ask_right_to_work": true,
    "ask_filming_equipment": true,
    "ask_travel_events": true,
    "ask_in_person_meetings": false,
    "require_portfolio": true,
    "allow_cover_letter_upload": true
  }'::jsonb,
  updated_at = now()
WHERE lower(title) IN ('content creator', 'content creator (full-time)');

-- =============================================================================
-- Social Media Manager (Full-time)
-- =============================================================================
UPDATE vacancies SET
  title = 'Social Media Manager',
  vacancy_type = 'paid',
  employment_basis = 'full-time',
  location = 'Edgbaston, Birmingham',
  is_remote = false,
  salary_range = 'Negotiable (based on experience)',
  closes_at = '2026-05-31'::timestamptz,
  description = 'Devanhaar is seeking a strategic, creative, and community-focused Social Media Manager to lead and grow our digital presence. You will build high-performing digital and social strategies, drive content planning, audience growth, campaign delivery, and community engagement across all our social platforms \u2014 strengthening our online presence, increasing engagement, and supporting awareness, outreach and community growth.',
  responsibilities = E'\u2022 Planning, creating, and executing social media content\n\u2022 Managing content calendars and scheduling posts\n\u2022 Managing and growing social media accounts across multiple initiatives & platforms (Instagram, TikTok, LinkedIn, Facebook, YouTube Shorts)\n\u2022 Analysing performance and improving content strategy\n\u2022 Building high-performing digital & social strategies, content planning, audience growth, campaign delivery, and community engagement across all social platforms\n\u2022 Strengthening our online presence, increasing engagement, and supporting awareness, outreach, and community growth\n\u2022 Filming and editing short-form content (Reels, TikToks, Shorts)\n\u2022 Designing social graphics (Canva / Adobe)\n\u2022 Writing captions, hooks, and calls-to-action',
  requirements = E'\u2022 1\u20134 years experience in social media management & content creation\n\u2022 Strong management skills\n\u2022 Clear, professional communication\n\u2022 Ability to coordinate & support teams\n\u2022 Experience in Sikh charity work (desirable)\n\u2022 Experience managing multiple brands/accounts (agency experience preferred)\n\u2022 Strong understanding of what makes content perform\n\u2022 Ability to analyse performance & adjust strategy\n\u2022 Confident being on camera when required',
  how_to_apply = NULL,
  is_active = true,
  application_config = '{
    "ask_dob": true,
    "ask_right_to_work": true,
    "ask_filming_equipment": false,
    "ask_travel_events": true,
    "ask_in_person_meetings": true,
    "require_portfolio": true,
    "allow_cover_letter_upload": true
  }'::jsonb,
  updated_at = now()
WHERE lower(title) IN ('social media manager', 'social media manager (full-time)');

-- 4. Storage policy already covers PDF/DOC/DOCX uploads via the existing
--    'vacancy-cvs' bucket; cover letters & portfolios share the same bucket.
