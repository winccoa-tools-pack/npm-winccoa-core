# WinCC OA Core Utils

Core utilities and type definitions for WinCC OA development. This library provides essential functionality for managing WinCC OA projects, components, and system interactions.

## 📦 Installation

```bash
npm install @winccoa-tools-pack/core-utils
```

## 🚀 Quick Start

### Working with Projects

```typescript
import {
    getRegisteredProjects,
    getRunningProjects,
    getRunnableProjects,
    getCurrentProjects,
    findProjectForFile
} from '@winccoa-tools-pack/core-utils';

// Get all registered projects from the system
const allProjects = await getRegisteredProjects();
console.log(`Found ${allProjects.length} registered projects`);

// Filter to only running projects
const running = await getRunningProjects();
console.log(`${running.length} projects are currently running`);

// Get projects that can be started
const runnable = await getRunnableProjects();

// Get the current active project (if any)
const current = await getCurrentProjects();
if (current.length > 0) {
    console.log(`Current project: ${current[0].getName()}`);
}

// Find which project a file belongs to
const filePath = '/opt/WinCC_OA_Projects/myProject/config/config';
const project = await findProjectForFile(filePath);
if (project) {
    console.log(`File belongs to project: ${project.getName()}`);
    console.log(`Project ID: ${project.getId()}`);
    console.log(`Project is runnable: ${project.isRunnable()}`);
}
```

### Managing Individual Projects

```typescript
import { ProjEnvProject } from '@winccoa-tools-pack/core-utils';

// Create and register a new project
const project = new ProjEnvProject();
project.setId('myProject');
project.setInstallDir('/opt/WinCC_OA_Projects/');
project.setVersion('3.21');
await project.registerProj();

// Check project status
if (project.isRegistered()) {
    console.log('Project successfully registered');
}

// Unregister when done
await project.unregisterProj();
```

### Working with WinCC OA Installations

```typescript
import {
    getAvailableWinCCOAVersions,
    getWinCCOAInstallationPathByVersion
} from '@winccoa-tools-pack/core-utils';

// Get all installed WinCC OA versions (sorted highest to lowest)
const versions = getAvailableWinCCOAVersions();
console.log('Installed versions:', versions);
// Example output: ['3.20', '3.19', '3.18']

// Get installation path for a specific version
const path = getWinCCOAInstallationPathByVersion('3.20');
if (path) {
    console.log(`WinCC OA 3.20 installed at: ${path}`);
}

// Paths are cached for performance - first lookup queries registry/filesystem,
// subsequent lookups return cached value immediately
```

## ✨ Features

### Component Management

- **WinCCOAComponent**: Base class for all WinCC OA components
  - Automatic executable discovery across installed versions
  - Process timeout handling for reliable execution
  - Detached process spawning support
  - Version-specific component targeting
  - Stdout/stderr capture with timestamped logging

### Project Management

- **ProjEnvProject**: Complete project lifecycle management
  - Project registration and unregistration
  - Async operations with automatic retry logic
  - Status polling with proper async/await
  - Configuration file handling

### Project Registry

- **ProjEnvProjectRegistry**: Automatic project tracking
  - Real-time file system monitoring (pvssInst.conf)
  - Debounced cache refresh (100ms) for performance
  - Automatic invalidation on configuration changes

### Utilities

- Path resolution for WinCC OA installations
- Version detection and comparison
- Localization helpers
- Log parsing and error handling

## 📦 Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run all tests
npm test

# Run only unit tests. Without WinCC OA instalation
npm run test:unit

# Run only integration tests. WinCC OA must be installed.
npm run test:integration

# Lint code
npm run lint

# Format code
npm run format

# Check code style
npm run style-check
```

## 🌳 Git Flow Workflow

This project uses [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for branch management:

### Branch Structure

- **`main`** - Production-ready code (stable releases)
- **`develop`** - Integration branch (pre-release features)
- **`feature/*`** - New features
- **`release/*`** - Release preparation
- **`hotfix/*`** - Emergency fixes for production

For detailed workflow information, see [docs/GITFLOW_WORKFLOW.md](docs/GITFLOW_WORKFLOW.md).

## 📖 Documentation

- [Source Code Overview](src/README.md) - Detailed module documentation
- [Changelog](CHANGELOG.md) - Version history and updates
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Development Docs](docs/dev/README.md) - Development guidelines

## 🔧 Configuration

### Windows EOL (CRLF) Note

This repository enforces LF line endings for configuration files via `.gitattributes` to avoid spurious diffs.

If you see CRLF→LF warnings on Windows, normalize the files once:

```powershell
cd C:\path\to\repo
git add --renormalize .
git commit -m "chore: apply eol normalization per .gitattributes"
```

## 🏆 Recognition

Special thanks to all our [contributors](https://github.com/orgs/winccoa-tools-pack/people) who make this project possible!

### Key Contributors

- **Martin Pokorny** ([@mPokornyETM](https://github.com/mPokornyETM)) - Creator & Lead Developer
- And many more amazing contributors!

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/winccoa-tools-pack/.github/blob/main/LICENSE) file for details.

Note: Some dependencies may use different license models.

---

## ⚠️ Disclaimer

**WinCC OA** and **Siemens** are trademarks of Siemens AG.
This project is not affiliated with, endorsed by, or sponsored by Siemens AG.
This is a community-driven open source project created to enhance the development experience for WinCC OA developers.

---

## 🎉 Thank You

Thank you for using WinCC OA tools package!
We're excited to be part of your development journey.
**Happy Coding! 🚀**

---

## Quick Links

• [📦 VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mPokornyETM.wincc-oa-projects)
• [📚 Documentation](docs/dev/README.md)
• [🐛 Report Issues](https://github.com/winccoa-tools-pack/npm-shared-library-core/issues)

---

<center>Made with ❤️ for and by the WinCC OA community</center>
