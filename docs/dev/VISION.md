# Development Vision - WinCC OA Core Library

## 🎯 Vision Statement

Create a **comprehensive, platform-agnostic, reusable TypeScript/Node.js library**
that provides core WinCC OA functionality for building automation tools, IDE extensions, and utilities across multiple platforms.

---

## 🌟 Core Objectives

### 1. **Separation of Concerns**

- Extract reusable WinCC OA logic from VS Code extension
- Create platform-agnostic utilities usable in any Node.js environment
- Enable code reuse across multiple tools and platforms

### 2. **High-Quality Foundation**

- Comprehensive test coverage (>80%)
- Type-safe TypeScript implementation
- Cross-platform compatibility (Windows, Linux, macOS)
- Performance-optimized with intelligent caching

### 3. **Developer Experience**

- Clear, well-documented APIs
- Intuitive function naming and structure
- Rich TypeScript type definitions
- Helpful error messages

### 4. **Ecosystem Growth**

- Enable community contributions
- Support multiple WinCC OA use cases
- Foundation for future tools and extensions

---

## 🏗️ Architecture Principles

### Layered Architecture

```txt
┌─────────────────────────────────────┐
│   Applications & Extensions         │  ← VS Code Extension, CLI tools, etc.
├─────────────────────────────────────┤
│   @winccoa-tools-pack/npm-winccoa-core    │  ← This library (core functionality)
├─────────────────────────────────────┤
│   Node.js Runtime & Platform APIs   │  ← File system, OS detection, etc.
├─────────────────────────────────────┤
│   WinCC OA Installation             │  ← Target system
└─────────────────────────────────────┘
```

### Design Principles

#### 1. **Platform Agnostic**

- No VS Code dependencies
- Abstract platform-specific operations
- Support Windows (registry), Linux (/opt), macOS

#### 2. **Functional & Composable**

- Pure functions where possible
- Composable utilities
- Minimal side effects
- Explicit dependency injection

#### 3. **Performance First**

- Intelligent caching strategies
- Lazy evaluation
- Efficient file system operations
- Avoid unnecessary computations

#### 4. **Type Safety**

- Strong TypeScript types
- No `any` types in public APIs
- Comprehensive type exports
- Runtime validation where needed

#### 5. **Testability**

- Unit tests for all functions
- Integration tests for workflows
- Mock-friendly architecture
- Platform-specific test strategies

---

## 📦 Package Structure

### Public API Surface

```typescript
// Utilities
import {
    getWinCCOAInstallationPathByVersion,
    getAvailableWinCCOAVersions,
    parseVersionString,
    compareVersions,
} from '@winccoa-tools-pack/npm-winccoa-core/utils';

// Types
import {
    DetailedVersionInfo,
    WinCCOAComponent,
    ComponentType,
} from '@winccoa-tools-pack/npm-winccoa-core/types';

// Core Logic
import {
    detectProject,
    analyzeComponents,
    validateHealth,
} from '@winccoa-tools-pack/npm-winccoa-core/core';
```

### Module Organization

#### `/src/utils/` - Utility Functions

- **Purpose**: Low-level helper functions
- **Examples**:
  - Path discovery and resolution
  - Version parsing and comparison
  - File system operations
  - Platform detection
- **Characteristics**:
  - Pure functions
  - No business logic
  - Highly reusable

#### `/src/types/` - Type Definitions

- **Purpose**: TypeScript interfaces and types
- **Examples**:
  - Version information structures
  - Component type definitions
  - Configuration schemas
- **Characteristics**:
  - Type-only exports
  - Well-documented
  - Comprehensive coverage

#### `/src/core/` - Business Logic

- **Purpose**: WinCC OA-specific logic
- **Examples**:
  - Project detection and parsing
  - Component analysis
  - Health checks
  - Dependency resolution
- **Characteristics**:
  - Uses utilities
  - Domain-specific
  - Stateful operations

---

## 🔧 Technology Stack

### Core Technologies

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+ (LTS)
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler (tsc)

### Testing

- **Framework**: node:test (native Node.js)
- **Assertion**: node:assert
- **Mocking**: Manual mocks / test doubles

### Code Quality

- **Linter**: ESLint with TypeScript rules
- **Formatter**: Prettier (optional)
- **Type Checking**: TypeScript strict mode
- **Pre-commit**: Husky + lint-staged (optional)

### Documentation

- **API Docs**: TSDoc + TypeDoc
- **Guides**: Markdown in `/docs`
- **Examples**: Code samples in docs

### CI/CD

- **Platform**: GitHub Actions
- **Triggers**: PR checks, release automation
- **Deployment**: npm registry (public)

---

## 🎨 API Design Philosophy

### Naming Conventions

#### Functions

- **Verbs first**: `getWinCCOAVersion()`, `parseVersionString()`, `detectProject()`
- **Clear intent**: `analyzeComponents()` not `analyze()`
- **Boolean predicates**: `isValidVersion()`, `hasComponent()`

#### Types/Interfaces

- **PascalCase**: `DetailedVersionInfo`, `WinCCOAComponent`
- **Descriptive names**: `ComponentType`, `ProjectConfiguration`
- **Avoid abbreviations**: `VersionInfo` not `VerInfo`

#### Constants

- **UPPER_SNAKE_CASE**: `DEFAULT_CACHE_TTL`, `MAX_RETRIES`
- **Group by domain**: `Version.DEFAULT_FORMAT`, `Path.SEPARATOR`

### Error Handling

#### Explicit Errors

```typescript
// Throw descriptive errors
throw new Error('WinCC OA version 3.19 not found in registry');

// Use custom error classes
class WinCCOANotFoundError extends Error {
    constructor(version?: string) {
        super(`WinCC OA ${version || ''} installation not found`);
        this.name = 'WinCCOANotFoundError';
    }
}
```

#### Error Recovery

- Return `null` or `undefined` for "not found" cases
- Throw errors for unexpected failures
- Provide fallback values where appropriate

### Async Operations

- Use `async/await` for clarity
- Return Promises for async operations
- Avoid callback-based APIs

---

## 🚀 Development Workflow

### Feature Development Cycle

1. **Plan**
    - Review migration plan
    - Identify source files
    - Define scope and tasks

2. **Branch**
    - Create feature branch from `develop`
    - Name: `feature/component-types`, `feat/project-detection`

3. **Implement**
    - Write implementation
    - Add comprehensive tests
    - Update types and exports

4. **Test**
    - Run unit tests locally
    - Verify cross-platform compatibility
    - Check coverage

5. **Document**
    - Add TSDoc comments
    - Update migration plan
    - Add usage examples

6. **Review**
    - Create PR to `develop`
    - CI/CD runs checks
    - Address review feedback

7. **Merge**
    - Squash or merge commit
    - Delete feature branch
    - Update tracking documents

### Release Workflow

1. **Prepare Release**
    - Merge all features to `develop`
    - Update version in `package.json`
    - Update CHANGELOG.md

2. **Create Release PR**
    - Open PR from `develop` → `main`
    - Label as `release`
    - Review changes

3. **Merge & Deploy**
    - Merge to `main`
    - CI/CD publishes to npm
    - Creates GitHub release
    - Tags version

4. **Post-Release**
    - Merge `main` → `develop`
    - Announce release
    - Update dependent projects

---

## 📊 Quality Metrics

### Code Quality

- **Linting**: Zero errors, minimal warnings
- **Complexity**: Keep cyclomatic complexity <10

### Performance

- **Cold Start**: <100ms for simple operations
- **Cached Operations**: <10ms
- **Memory**: Efficient caching, no memory leaks
- **File I/O**: Batch operations, minimize reads

### Documentation

- **API Coverage**: 100% of public APIs documented
- **Examples**: At least one example per major feature
- **Guides**: Setup, usage, troubleshooting
- **Changelog**: Maintained with every release

---

## 🛠️ Tooling & Scripts

### npm Scripts

```json
{
    "scripts": {
        "build": "tsc --build",
        "test": "npm run build && node --test",
        "test:watch": "node --test --watch",
        "test:coverage": "c8 node --test",
        "lint": "eslint src/ test/",
        "lint:fix": "eslint src/ test/ --fix",
        "docs": "typedoc src/index.ts",
        "clean": "rm -rf dist/",
        "prepublishOnly": "npm run clean && npm run build && npm test"
    }
}
```

### VS Code Configuration

```json
// .vscode/settings.json
{
    "typescript.tsdk": "node_modules/typescript/lib",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

---

## 🌍 Cross-Platform Considerations

### Windows

- **Registry Access**: Use `child_process.execSync('reg query ...')`
- **Path Format**: Handle `C:\` and backslashes
- **Line Endings**: CRLF (`\r\n`)
- **Case Sensitivity**: Case-insensitive paths

### Linux

- **Installation Path**: `/opt/WinCC_OA/`
- **Path Format**: Forward slashes
- **Line Endings**: LF (`\n`)
- **Case Sensitivity**: Case-sensitive paths
- **Permissions**: Check read/execute permissions

### macOS

- **Installation Path**: TBD (likely `/Applications/` or `/opt/`)
- **Path Format**: Forward slashes
- **Line Endings**: LF (`\n`)
- **Case Sensitivity**: Configurable (usually case-insensitive)

### Abstraction Strategy

```typescript
// Platform detection
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const isMacOS = process.platform === 'darwin';

// Platform-specific implementations
function getInstallPath(): string | null {
    if (isWindows) return getWindowsInstallPath();
    if (isLinux) return getUnixInstallPath();
    if (isMacOS) return getMacOSInstallPath();
    return null;
}
```

---

## 🎯 Future Roadmap

### v0.1.0 - Initial Release (Current)

- ✅ Utilities: Path discovery, version parsing
- 🔄 Types: Version info, components
- 📋 Core: Project detection (planned)

### v0.2.0 - Core Logic Expansion

- Component analysis
- Health checks
- Dependency resolution

### v0.3.0 - Advanced Features

- Configuration management
- Template generation
- Build automation helpers

### v1.0.0 - Stable Release

- Complete API coverage
- Full documentation
- Performance optimized
- Used in production (vs-code extensions)

### v1.x - Enhancements

- Additional platforms (macOS)
- Advanced caching strategies
- Performance benchmarks
- Community contributions

---

## 🤝 Contribution Guidelines

### Code Standards

- Follow TypeScript best practices
- Write tests for all new code
- Document public APIs with TSDoc
- Keep functions small and focused

### Commit Messages

- Use conventional commits format
- Be descriptive but concise
- Reference issues/PRs when applicable

### Pull Requests

- One feature/fix per PR
- Include tests and documentation
- Ensure CI/CD passes
- Respond to review feedback

---

## 📚 Learning Resources

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Node.js Testing

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#testing)

### WinCC OA

- Internal WinCC OA documentation
- Component structure reference
- Version compatibility matrix

---

**Last Updated**: December 3, 2025  
**Vision Status**: Active Development  
**Target Release**: v1.0.0 (Q1 2026)

---

## 🎉 Thank You

Thank you for using WinCC OA tools package!
We're excited to be part of your development journey. **Happy Coding! 🚀**

---

## Quick Links

• [📦 npm package](https://www.npmjs.com/package/@winccoa-tools-pack/npm-winccoa-core)

---

<center>Made with ❤️ for and by the WinCC OA community</center>
