# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/winccoa-tools-pack/npm-winccoa-core/compare/v0.1.1-rc.202512302248.5b48184.0...v0.2.0) (2025-12-31)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **WinCCOAComponent**: Added `timeout` option to `start()` method for process execution time limits
- **WinCCOAComponent**: Added `version` option to `start()` and `getPath()` methods to target specific WinCC OA versions
- **WinCCOAComponent**: Added timeout support to `execAndCollectLines()` method
- **WinCCOAComponent**: Added `getFullVersion()` method to retrieve component version with timeout protection
- **ProjEnvProjectRegistry**: Implemented file system watcher for automatic cache refresh on pvssInst.conf changes
- **ProjEnvProjectRegistry**: Added 500ms debouncing for file change events to prevent premature reads
- **ProjEnvProject**: Added retry logic for `registerProj()` and `unregisterProj()` methods
- **ProjEnvProject**: Implemented proper async/await polling for registration status checks
- ISO 8601 timestamps added to all console.log outputs for better debugging

### Fixed

- **WinCCOAComponent**: Fixed detached process spawning on Windows with proper `stdio: 'ignore'` and `unref()` calls
- **ProjEnvProject**: Fixed `sleep()` function calls by properly awaiting async operations
- **ProjEnvProject**: Fixed registration status polling by reloading project registries between checks
- **Test Suite**: Added `--test-force-exit` flag to stop tests immediately on first failure

### Changed

- **ProjEnvProject**: Increased registration polling attempts to 50 with 100ms intervals (5 seconds total)
- **ProjEnvProject**: Reduced unregistration timeout to 5 attempts (500ms total)
- **Documentation**: Comprehensively updated all JSDoc comments to reflect new features and async behavior
