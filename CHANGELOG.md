# Changelog

> Last updated: 2026-02-03

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-05

### Added

- Module-scoped exports (`numbers`, `localization`, `validation`, `finance`, `date-tools`) برای tree-shakable consumption.
- Type-safe utilities module exports and library build pipeline.
- Typedoc API documentation generation.
- CI pipelines for linting, testing, security, PR validation, and release automation.
- CI artifact برای coverage report در pull requests.
- Dependabot configuration for dependencies and GitHub Actions.
- Benchmarks and examples for Node and browser usage.

### Changed

- Storybook dev stack moved to v9 alpha to align with Next 16 (peer warning acceptable in dev).
- CI now runs full coverage (`pnpm test:ci`) by default.
- API docs and README now document NPM subpath imports.
- Restructured shared utilities into domain-focused modules.
- Improved numeric and Persian localization utilities with stricter normalization.

### Fixed

- Improved input normalization for loose number parsing.

## [1.0.0] - 2026-02-01

### Added

- Initial release with PDF, financial, image, text, and date tools.
