# WinCC OA Core Library - Migration Plan

## Overview
This document outlines the step-by-step plan to migrate reusable WinCC OA functionality from `vs-code-projects-viewer` extension into the `npm-shared-library-core` package.

## Repository Structure
```
npm-shared-library-core/
├── src/
│   ├── utils/          # Utility functions (paths, version parsing)
│   ├── types/          # Type definitions (version info, components)
│   ├── core/           # Core business logic
│   └── index.ts        # Main exports
├── test/
│   ├── utils/          # Utility tests
│   ├── types/          # Type tests
│   └── core/           # Core logic tests
└── docs/
    ├── dev/            # Development documentation
    └── automation/     # CI/CD and automation docs
```

---

## Migration Phases

### ✅ Phase 1: Repository Structure Setup (COMPLETED)
**Status**: Merged to `develop`

**Completed Steps**:
- Created directory structure (`/src`, `/test`, `/docs`)
- Added README.md files with standard footers
- Established Git Flow workflow with CI/CD

---

### ✅ Phase 2: Core Utilities Migration (COMPLETED)
**Status**: Merged to `develop`

**Step 2.1**: WinCC OA Path Discovery Utilities ✅
- **Files Migrated**:
  - `src/utils/winccoa-paths.ts` - Platform-specific installation path discovery
  - `src/utils/winccoa-version-info.ts` - Version parsing and comparison
  - `src/utils/index.ts` - Module exports
- **Tests Created**:
  - `test/utils/winccoa-paths.test.ts` - Platform detection, caching, version sorting
  - `test/utils/winccoa-version-info.test.ts` - Version parsing edge cases
- **Key Functions**:
  - `getWinCCOAInstallationPathByVersion()` - Get install path for specific version
  - `getAvailableWinCCOAVersions()` - List all installed versions
  - `parseVersionString()` - Convert version string to comparable number (format: `major.minor.patch`)
  - `compareVersions()` - Semver-compatible comparison
- **Commit**: `feat(utils): add WinCC OA path discovery utilities`

---

### 🔄 Phase 3: Type Definitions Migration (IN PROGRESS)

**Step 3.1**: Version Information Types
- **Source**: `vs-code-projects-viewer/src/types/version/DetailedVersionInfo.ts`
- **Target**: `src/types/version/DetailedVersionInfo.ts`
- **Description**: Migrate version metadata types
- **Dependencies**: `winccoa-version-info` utilities
- **Tasks**:
  - [ ] Create `src/types/version/` directory
  - [ ] Copy `DetailedVersionInfo.ts` interface
  - [ ] Update imports to use local utilities
  - [ ] Create corresponding tests
  - [ ] Export from `src/types/index.ts`
- **Commit**: `feat(types): add version information types`

**Step 3.2**: WinCC OA Component Types
- **Source**: `vs-code-projects-viewer/src/types/components/`
- **Target**: `src/types/components/`
- **Description**: Migrate component type system (base class + implementations)
- **Files to Migrate**:
  - `WinCCOAComponent.ts` - Base component interface/class
  - `ComponentImplementations.ts` - Concrete implementations (Manager, Panel, Script, etc.)
- **Considerations**:
  - Remove VS Code-specific dependencies
  - Keep only core component logic
  - Ensure platform-agnostic
- **Tasks**:
  - [ ] Create `src/types/components/` directory
  - [ ] Copy `WinCCOAComponent.ts` (base class)
  - [ ] Copy component implementations
  - [ ] Remove VS Code tree item logic
  - [ ] Create component tests
  - [ ] Export from `src/types/index.ts`
- **Commit**: `feat(types): add WinCC OA component type system`

---

### 📋 Phase 4: Core Business Logic Migration (PLANNED)

**Step 4.1**: Project Detection and Parsing
- **Description**: Logic to detect and parse WinCC OA projects
- **Source Files**:
  - Project configuration parsing
  - Component discovery logic
  - Dependency resolution
- **Tasks**:
  - [ ] Create `src/core/project/` directory
  - [ ] Migrate project detection logic
  - [ ] Migrate configuration parsing
  - [ ] Create comprehensive tests
- **Commit**: `feat(core): add project detection and parsing`

**Step 4.2**: Component Analysis
- **Description**: Component validation, dependency tracking, health checks
- **Tasks**:
  - [ ] Create `src/core/analysis/` directory
  - [ ] Migrate component validation logic
  - [ ] Migrate dependency analyzer
  - [ ] Create analysis tests
- **Commit**: `feat(core): add component analysis logic`

**Step 4.3**: Health and Status Utilities
- **Description**: Project health checks, version compatibility validation
- **Tasks**:
  - [ ] Create `src/core/health/` directory
  - [ ] Migrate health check logic
  - [ ] Migrate status reporting
  - [ ] Create health check tests
- **Commit**: `feat(core): add health and status utilities`

---

### 📚 Phase 5: Testing & Documentation (ONGOING)

**Step 5.1**: Integration Tests
- **Description**: End-to-end tests for complete workflows
- **Tasks**:
  - [ ] Create `test/integration/` directory
  - [ ] Add project discovery integration tests
  - [ ] Add version detection integration tests
  - [ ] Add component analysis integration tests
- **Commit**: `test: add integration tests`

**Step 5.2**: API Documentation
- **Description**: Generate comprehensive API documentation
- **Tasks**:
  - [ ] Add TSDoc comments to all public APIs
  - [ ] Generate API documentation with TypeDoc
  - [ ] Create usage examples
  - [ ] Add troubleshooting guide
- **Commit**: `docs: add API documentation and examples`

**Step 5.3**: Performance Optimization
- **Description**: Optimize caching and performance-critical paths
- **Tasks**:
  - [ ] Review and optimize caching strategies
  - [ ] Add performance benchmarks
  - [ ] Optimize file system operations
  - [ ] Document performance characteristics
- **Commit**: `perf: optimize caching and file operations`

---

## Git Flow Workflow

### Branch Strategy
- **main**: Production releases only
- **develop**: Integration branch for ongoing work
- **feature/**: Feature branches (e.g., `feature/component-types`)
- **hotfix/**: Emergency fixes for production

### Commit Process
1. Create feature branch from `develop`
2. Implement changes with focused commits
3. Push branch and create PR to `develop`
4. CI/CD runs tests and builds
5. Review and merge to `develop`
6. Release: Merge `develop` → `main` → auto-publish to npm

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`

**Examples**:
- `feat(utils): add WinCC OA path discovery utilities`
- `feat(types): add version information types`
- `fix(utils): handle missing registry keys on Windows`
- `test(utils): add edge case coverage for version parsing`
- `docs: update migration plan with Phase 3 details`

---

## Testing Strategy

### Unit Tests
- **Location**: `test/utils/`, `test/types/`, `test/core/`
- **Framework**: `node:test` (native Node.js test runner)
- **Coverage Target**: >80%
- **Run**: `npm test`

### Integration Tests
- **Location**: `test/integration/`
- **Purpose**: Test complete workflows
- **Run**: `npm run test:integration`

### Platform-Specific Tests
- **Windows**: Registry queries, path detection
- **Linux**: `/opt` path scanning, version detection
- **Mock Strategy**: Mock file system and registry operations

---

## CI/CD Pipeline

### Pull Request Checks (Automated)
- ✅ Build on Node.js 18.x, 20.x, 22.x
- ✅ Run all tests
- ✅ Lint code
- ✅ Type checking
- ✅ Generate coverage report

### Release Process (Automated)
1. Merge PR to `develop`
2. Merge `develop` → `main` for release
3. CI/CD triggers:
   - Runs full test suite
   - Builds package
   - Publishes to npm registry
   - Creates GitHub release
   - Updates changelog

---

## Dependencies Strategy

### Keep Minimal
- Avoid VS Code-specific dependencies (`vscode` module)
- Use Node.js built-ins where possible (`fs`, `path`, `os`)
- Platform-agnostic logic only

### Peer Dependencies
- None required (standalone utility library)

### Dev Dependencies
- TypeScript
- Node.js test framework
- Linting tools (ESLint)
- Documentation generators (TypeDoc)

---

## Version Strategy

### Semantic Versioning (SemVer)
- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, backward compatible

### Pre-release Versions
- **Alpha**: `0.1.0-alpha.1` - Early development
- **Beta**: `0.1.0-beta.1` - Feature complete, testing
- **RC**: `0.1.0-rc.1` - Release candidate

### Current Version
- `0.1.0` - Initial development phase

---

## Next Steps (Immediate)

1. **Complete Phase 3.1**: Migrate version information types
   - Copy `DetailedVersionInfo.ts`
   - Update imports
   - Create tests
   - Commit and create PR

2. **Complete Phase 3.2**: Migrate component types
   - Copy component type files
   - Remove VS Code dependencies
   - Create tests
   - Commit and create PR

3. **Plan Phase 4**: Define business logic migration scope
   - Identify core logic to extract
   - Map dependencies
   - Create detailed task list

---

## Success Criteria

### Phase Completion Checklist
- [ ] All source files migrated
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Documentation complete
- [ ] CI/CD pipeline green
- [ ] PR reviewed and approved
- [ ] Merged to `develop`

### Final Release Criteria
- [ ] All phases completed
- [ ] Integration tests passing
- [ ] API documentation published
- [ ] Version 1.0.0 released to npm
- [ ] vs-code-projects-viewer updated to use core library

---

## Resources

- **Source Repository**: [vs-code-projects-viewer](https://github.com/winccoa-tools-pack/vs-code-projects-viewer)
- **Target Repository**: [npm-shared-library-core](https://github.com/winccoa-tools-pack/npm-shared-library-core)
- **CI/CD Workflows**: `.github/workflows/`
- **Git Flow Guide**: `docs/GITFLOW_WORKFLOW.md`

---

**Last Updated**: December 3, 2025  
**Current Phase**: Phase 3 - Type Definitions Migration  
**Next Milestone**: Complete component type system migration
