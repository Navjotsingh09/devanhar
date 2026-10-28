# CMS release verification — 28 October 2026

This is the current release record and supersedes the earlier migration-blocked status reports.

## Database

The user applied `cms-insights-delegation.sql`. Installation was independently verified: article assignment table with RLS, permission RPC and article/project column exist. The rollback-only delegation suite passed: project inheritance, unassigned draft isolation, denied publishing without Publish, denied unrelated creation, rejected foreign revisions, revision restoration, inherited grant revocation and exact View-only access. Zero test articles, projects or assignments remained; the temporary role change was rolled back. Anonymous assignment execution is denied. Installation and zero retained test articles/projects were checked again on 28 October.

## Code and existing site changes

The release combines the CMS branch with main commit `1e83b69491931051af4f5c987aa5257c7468de26`. The five newer SPA files are merged, preserving its current login handling and public flag/percentage removal. Existing Roots and Wrestling content stays in the CMS release.

## Acceptance limitation

The automated suite and database assertions are separate from browser acceptance. Authenticated Admin/Super Admin browser scenarios have NOT passed: the existing staff session expired, and earlier secure sign-in requests were declined. No credential request or authentication bypass has been retried. The 55 manual scenarios remain available in `cms-full-admin-acceptance.md`. Production deployment is recorded separately when verified; this document does not claim 100% acceptance.

## Combined validation

656 automated assertions passed across 24 regression files after merging current main. Production build compiled successfully and generated 141 pages. The SPA fixtures now reflect active SPA membership rather than general CRM roles, including fresh-session reuse and denial after revocation. The optional source-workbook test remains explicitly excluded.
