<!-- asdev:template_id=seo-technical-contract version=1.0.0 source=standards/seo/technical-seo-standard.md -->

# Technical SEO Contract

## Canonical

- Canonical base URL is environment-driven.
- Production fallback must be a real owned domain, never placeholder.

## Sitemap

- Include only indexable routes.
- Exclude hash fragments and auth/private URLs.

## Robots

- Declare sitemap URL.
- Disallow sensitive route groups (`/api`, `/admin`, `/auth`, private panels).

## Structured Data

- Required baseline: `Person`, `Organization`, `WebSite`.
- If commercial service page exists: include `Service` schema with provider and canonical service URL.

## CI Gate Checklist

- Canonical host validation test
- Sitemap validity/indexability test
- Required schema presence test
