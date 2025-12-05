# AI Assistant Prompts - WinCC OA Core Library Development

This document contains ready-to-use prompts for GitHub Copilot and other AI assistants to help with development tasks.

---

## 🔧 Feature Development Prompts

### Migrate New Utility Function

```txt
I need to migrate the function [FUNCTION_NAME] from vs-code-projects-viewer to npm-shared-library-core.

Source file: vs-code-projects-viewer/src/[PATH]/[FILENAME]
Target: npm-shared-library-core/src/[TARGET_PATH]/[FILENAME]

Steps:
1. Read the source file and identify dependencies
2. Create the target file with proper TypeScript types
3. Remove any VS Code-specific dependencies
4. Update imports to use local utilities
5. Create comprehensive unit tests
6. Export from the appropriate index.ts file

Ensure the function is platform-agnostic and follows the project's coding standards.
```

### Create Type Definitions

```txt
Create TypeScript type definitions for [CONCEPT] in the WinCC OA core library.

Requirements:
- File: src/types/[CATEGORY]/[NAME].ts
- Export all types from src/types/index.ts
- Add TSDoc comments for all interfaces and types
- Include usage examples in comments
- Ensure types are compatible with existing utilities

Types needed:
- [TYPE_1]: [Description]
- [TYPE_2]: [Description]
```

### Add Unit Tests

```txt
Create comprehensive unit tests for [FILE_PATH].

Test file: test/[MATCHING_PATH].test.ts

Coverage requirements:
- Test all exported functions
- Include edge cases (empty strings, null, undefined, invalid input)
- Test platform-specific behavior (Windows/Linux)
- Test caching mechanisms if applicable
- Test error handling

Use node:test framework with describe/it structure and node:assert for assertions.
```

### Implement Core Business Logic

````txt
Implement [FEATURE_NAME] business logic for the WinCC OA core library.

Feature description: [DETAILED_DESCRIPTION]

Requirements:
- File: src/core/[CATEGORY]/[FEATURE_NAME].ts
- Use existing utilities from src/utils/
- Use existing types from src/types/
- Platform-agnostic implementation
- Comprehensive error handling
- Include caching where appropriate
- Add unit tests in test/core/[CATEGORY]/[FEATURE_NAME].test.ts

Expected API:
```typescript
export function [functionName]([params]): [ReturnType] {
  // Implementation
}
````

---

## 🐛 Bug Fix Prompts

### Fix Failing Test

```txt

The test [TEST_NAME] in [TEST_FILE] is failing.

Error message:
[ERROR_MESSAGE]

Please:

1. Analyze the test failure
2. Identify the root cause
3. Fix the implementation or test as appropriate
4. Verify all tests pass
5. Explain what was wrong and how it was fixed

````

### Fix Platform-Specific Issue

```txt

There's a platform-specific issue on [Windows/Linux/macOS].

Issue description: [DESCRIPTION]
Expected behavior: [EXPECTED]
Actual behavior: [ACTUAL]

Please:

1. Identify the platform-specific code causing the issue
2. Implement proper platform abstraction
3. Add platform-specific tests
4. Verify fix works on all platforms

```

### Fix Type Error

```txt

TypeScript is reporting a type error in [FILE_PATH]:

Error:
[ERROR_MESSAGE]

Please:

1. Analyze the type mismatch
2. Fix type definitions or implementation
3. Ensure strict type checking passes
4. Update related types if necessary

```

---

## 📝 Documentation Prompts

### Generate API Documentation

```txt

Generate comprehensive TSDoc documentation for [FILE_PATH].

Include:

- Function/class descriptions
- Parameter descriptions with types
- Return value descriptions
- Usage examples
- Edge cases and error conditions
- Related functions or types
- Version information (if applicable)

Format according to TSDoc standards for TypeDoc generation.

```

### Create Usage Guide

```txt

Create a usage guide for [FEATURE_NAME] in docs/[CATEGORY]/[GUIDE_NAME].md.

Include:

- Overview and purpose
- Installation/setup instructions
- Basic usage examples
- Advanced usage examples
- Common use cases
- Troubleshooting common issues
- API reference links
- Related documentation

```

### Update Migration Plan

```txt

Update docs/dev/MIGRATION_PLAN.md to reflect:

- Completed: [LIST_COMPLETED_TASKS]
- In Progress: [CURRENT_WORK]
- Next Steps: [UPCOMING_TASKS]

Update the appropriate phase status and checkboxes. Add any new insights or considerations discovered during implementation.

```

---

## 🧪 Testing Prompts

### Add Integration Tests

```txt

Create integration tests for [FEATURE_NAME] that test the complete workflow.

Test file: test/integration/[FEATURE_NAME].test.ts

Test scenarios:

1. [SCENARIO_1]
2. [SCENARIO_2]
3. [SCENARIO_3]

Each test should:

- Set up realistic test data
- Execute the complete workflow
- Verify end-to-end behavior
- Clean up test artifacts

```

### Mock Platform-Specific Operations

```txt

Create mock implementations for platform-specific operations in [FEATURE_NAME].

Mock:

- File system operations (fs.readFileSync, fs.existsSync)
- Registry queries (Windows)
- Command execution (child_process.execSync)
- Environment variables (process.env, process.platform)

Use test doubles that can be injected for testing. Ensure tests can run without actual WinCC OA installation.

```

### Add Performance Tests

```txt

Create performance benchmarks for [FEATURE_NAME].

Measure:

- Execution time for typical operations
- Memory usage
- Cache hit/miss rates
- File system access frequency

Compare:

- Cold start performance
- Cached operation performance
- Performance across different platforms

```

---

## 🔄 Refactoring Prompts

### Extract Common Logic

```txt

I see duplicate code in [FILE_1] and [FILE_2] for [FUNCTIONALITY].

Please:

1. Extract the common logic into a shared utility function
2. Place it in src/utils/[APPROPRIATE_FILE].ts
3. Update both original files to use the new utility
4. Add tests for the extracted function
5. Verify existing tests still pass

```

### Improve Type Safety

```txt

The function [FUNCTION_NAME] in [FILE_PATH] uses weak types (any, unknown, or loose unions).

Please:

1. Define precise TypeScript types
2. Add runtime validation if needed
3. Update function signature
4. Update tests to verify type safety
5. Ensure strict TypeScript checks pass

```

### Optimize Performance

```txt

The function [FUNCTION_NAME] in [FILE_PATH] has performance issues:
[DESCRIBE_ISSUE]

Please:

1. Analyze the performance bottleneck
2. Implement optimization (caching, memoization, batching, etc.)
3. Add performance-related tests
4. Measure improvement
5. Document optimization strategy

```

---

## 🚀 Release Prompts

### Prepare Release

```txt

Prepare release v[VERSION] of @winccoa-tools-pack/core-utils.

Tasks:

1. Update version in package.json to [VERSION]
2. Update CHANGELOG.md with changes since last release
3. Verify all tests pass
4. Build package (npm run build)
5. Check package contents (npm pack --dry-run)
6. Create release notes summarizing key changes

```

### Update Changelog

```txt

Update CHANGELOG.md with all changes since version [LAST_VERSION].

Review commits in range [COMMIT_RANGE] and categorize:

- Added: New features
- Changed: Changes in existing functionality
- Deprecated: Soon-to-be removed features
- Removed: Removed features
- Fixed: Bug fixes
- Security: Security fixes

Format according to Keep a Changelog standard.

```

---

## 🏗️ Architecture Prompts

### Design New Feature

```txt

Design the architecture for [FEATURE_NAME].

Requirements:
[LIST_REQUIREMENTS]

Please provide:

1. Module structure (file organization)
2. Public API design (function signatures, types)
3. Internal implementation strategy
4. Dependencies (existing utilities/types needed)
5. Testing approach
6. Migration path from existing code (if applicable)
7. Example usage

```

### Review Architecture Decision

```txt

Review the current implementation of [FEATURE_NAME] and suggest improvements.

Consider:

- Separation of concerns
- Code reusability
- Performance implications
- Type safety
- Error handling
- Testing strategy
- Platform compatibility
- API design consistency

Provide specific recommendations with examples.

```

---

## 📦 Package Management Prompts

### Add Dependency

```txt

I need to add [PACKAGE_NAME] as a dependency for [REASON].

Please:

1. Evaluate if this dependency is necessary or if we can use Node.js built-ins
2. Check package size and bundle impact
3. Verify license compatibility
4. Check for security vulnerabilities
5. Add to package.json (dependencies or devDependencies)
6. Update documentation if it affects public API

```

### Remove Dependency

```txt

Evaluate if we can remove dependency [PACKAGE_NAME].

Tasks:

1. Find all usages of this dependency
2. Identify alternatives (Node.js built-ins, other packages, custom implementation)
3. Implement replacement
4. Update tests
5. Verify bundle size reduction
6. Remove from package.json

```

---

## 🎯 Specific Task Prompts

### Phase 3.1: Migrate Version Types

```txt

Migrate version type definitions from vs-code-projects-viewer to npm-shared-library-core.

Source: vs-code-projects-viewer/src/types/version/DetailedVersionInfo.ts
Target: npm-shared-library-core/src/types/version/DetailedVersionInfo.ts

Steps:

1. Create src/types/version/ directory
2. Copy DetailedVersionInfo.ts interface
3. Remove VS Code dependencies
4. Update imports to use local utilities (parseVersionString, etc.)
5. Export from src/types/index.ts
6. Create tests in test/types/version/DetailedVersionInfo.test.ts
7. Commit with message: "feat(types): add version information types"

```

### Phase 3.2: Migrate Component Types

```txt

Migrate WinCC OA component type system from vs-code-projects-viewer to npm-shared-library-core.

Source files:

- vs-code-projects-viewer/src/types/components/WinCCOAComponent.ts
- vs-code-projects-viewer/src/types/components/ComponentImplementations.ts

Target: npm-shared-library-core/src/types/components/

Steps:

1. Create src/types/components/ directory
2. Copy WinCCOAComponent.ts (base component interface/class)
3. Copy ComponentImplementations.ts
4. Remove VS Code tree item logic (TreeItem, TreeItemCollapsibleState, etc.)
5. Keep core component properties (name, type, path, etc.)
6. Export from src/types/index.ts
7. Create component tests
8. Commit with message: "feat(types): add WinCC OA component type system"

```

### Fix Version Parsing Logic

```txt

The version parsing function has incorrect output for WinCC OA version format.

WinCC OA versions follow: <major>.<minor>.<patch> where patch is optional.

Expected behavior:

- "3.19" → 319000 (major=3, minor=19, patch=0)
- "3.19.1" → 319001 (major=3, minor=19, patch=1)
- "3.20.5" → 320005 (major=3, minor=20, patch=5)

Formula: major *100000 + minor* 1000 + patch

Fix src/utils/winccoa-version-info.ts and update all tests in test/utils/winccoa-version-info.test.ts.

```

---

## 🎨 Code Style Prompts

### Format Code

```txt

Format the code in [FILE_PATH] according to project style guidelines:

- Use 4 spaces for indentation
- Add proper spacing around operators
- Use descriptive variable names
- Keep functions under 50 lines
- Add blank lines between logical sections
- Follow TypeScript naming conventions

```

### Add Code Comments

```txt

Add helpful comments to [FILE_PATH]:

- Document complex algorithms
- Explain non-obvious decisions
- Add TODO/FIXME for known issues
- Keep comments concise and up-to-date
- Use TSDoc format for public APIs

```

---

## 🤖 AI Assistant Tips

### When to Use Each Prompt

- **Feature Development**: Starting new functionality
- **Bug Fix**: Addressing test failures or reported issues
- **Documentation**: Creating or updating docs
- **Testing**: Adding test coverage
- **Refactoring**: Improving existing code
- **Release**: Preparing for version release
- **Architecture**: Planning major changes

### Customizing Prompts

Replace placeholders:

- `[FUNCTION_NAME]`: Actual function name
- `[FILE_PATH]`: Relative file path
- `[DESCRIPTION]`: Detailed description
- `[VERSION]`: Version number (e.g., 0.2.0)

### Iterative Development

1. Start with high-level prompt
2. Review AI output
3. Refine with specific follow-up prompts
4. Verify and test results

---

**Last Updated**: December 3, 2025  
**Usage**: Copy and customize these prompts for your development workflow

---

## 🎉 Thank You

Thank you for using WinCC OA tools package!
We're excited to be part of your development journey. **Happy Coding! 🚀**

---

## Quick Links

• [📦 VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mPokornyETM.wincc-oa-projects)

<center>Made with ❤️ for and by the WinCC OA community</center>
