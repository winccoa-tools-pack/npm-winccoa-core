# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.9] - 2026-11-26

### Fixed

- resolve katex and js-yaml security alerts in dev dependencies (#202)
- use client-id instead of the deprecated app-id for the bot token (#198)
- ignore TypeScript 7 and ESLint 10 updates until the lint tooling supports them (#196)

### Changed

- deps-dev(deps-dev): bump @types/node from 25.6.2 to 26.6.6 (#185)
- align .github files and scripts with the template (#201)
- prefer REPO_ADMIN_TOKEN over the bot app token for merges and branch updates (#199)
- use the winccoa-tools-pack-bot app token for automated PR actions (#197)
- bump actions/checkout from 6 to 7 (#167)
- run integration tests manually and warn on limited test coverage (#194)
- add apply-settings helper scripts and actions policy (#193)
- auto-release patch and minor releases (#192)
- deps-dev(deps-dev): bump the dev-tools group across 1 directory with 2 updates (#163)
- bump actions/setup-node from 6 to 7 (#174)
- bump smol-toml and markdownlint-cli (#191)
- deps-dev(deps-dev): bump typescript-eslint from 8.59.3 to 8.73.0 (#186)
- deps-dev(deps-dev): bump globals from 17.6.0 to 17.14.0 (#187)
- deps-dev(deps-dev): bump markdownlint from 0.40.0 to 0.42.2 (#184)
- deps-dev(deps-dev): bump @humanfs/node from 0.16.7 to 0.16.8 (#189)
- deps-dev(deps-dev): bump tsx from 4.21.0 to 4.23.15 (#182)
- align .github with template-npm-shared-library (#181)
- use org reusable rebase-open-prs (#153)

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.2.4] - 2026-02-13

### Added

- **Build**: Added `scripts/fix-esm-imports.mjs` and wired it into `build:esm` to ensure generated ESM output includes required `.js` extensions for relative imports
- **Utilities**: Added `getAllWinCCOAComponents(oaVersion)` to enumerate available WinCC OA component implementations for a given installation/version
- **ProjEnvProjectRegistry**: Added product lookup helpers (`getProductByVersion`, `getLastUsedProjectDir`) and cache management to support file-watching use cases
- **Tests**: Added integration coverage for component discovery and unit coverage for project-version fallback behavior

### Changed

- **ESM**: Updated TS import paths to remove file extensions and improve compatibility with the ESM build pipeline
- **ProjEnvProject**: Improved project version resolution by falling back to `proj_version` from the project config when `installationVersion` is missing in the registry
- **CI**: Git Flow validation now supports forked branches in rule evaluation
- **Dependencies**: Updated dev tooling (notably ESLint 10 and related packages)
- **Documentation**: Updated README docs for the new utilities and version fallback behavior

### Removed

- **Components**: Removed unused/legacy component implementation classes: `AlertManagerComponent`, `AndroidComponent`, `ConfComponent`, `IosComponent`, `JavaComponent`, `VisionComponent`, `WebUIComponent`
- **GitHub**: Removed outdated root pull request template (`.github/pull_request_template.md`) in favor of the templated variants under `.github/PULL_REQUEST_TEMPLATE/`

### Fixed

- **ProjEnvProject**: Enhanced error handling for project version checks

## [0.2.3] - 2026-02-04

### Fixed

- **Release**: Update `package.json` version inside the tarball before `npm publish`
- **Release**: Ignore broken pipe errors when listing tarball contents

## [0.2.2] - 2026-02-04

### Added

- **CI**: Added Git Flow workflow automation (`.github/workflows/gitflow.yml`)

### Changed

- **Release**: Improved reusable release workflow (`.github/workflows/release-reusable.yml`)

## [0.2.1] - 2026-02-03

### Added

- **CI/Automation**: Added repository rulesets, settings payload generation, and workflows for applying org/repo policies
- **CI/Automation**: Added release branch creation workflow and reusable pre-release/release workflows
- **Tests**: Added `scripts/run-node-tests.ts` to run Node's test runner via `tsx` and improved unit/integration test coverage
- **Tests**: Integration tests added/expanded (e.g. manager insertion and PMON manager-option parsing)
- **PmonComponent**: Expanded parsing/validation behavior and added tests for manager options

### Changed

- **ProjEnvProject / ProjEnvProjectConfig / ProjEnvProjectRegistry**: Improved runnable-project handling and registry interactions
- **WinCCOAComponent**: Updated component execution behavior and related implementation details

## [0.1.2] - 2026-01-05

### Changed

- **Tooling**: Switched to the newer ESLint config layout (`eslint.config.cjs`) and refreshed dev tooling/config files
- **ProjEnvProject**: Updated runnable-project fixtures and improved project/config handling
- **Documentation/Repo**: Updated GitHub issue templates and related repository meta files

## [0.1.0] - 2025-12-31

### Added

- Initial public release of the WinCC OA core utilities and types

[Unreleased]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.2.4-d7edf38...HEAD
[0.2.4]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.2.3...v0.2.4-d7edf38
[0.2.3]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.1.2...v0.2.1
[0.1.2]: https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.1.0...v0.1.2
