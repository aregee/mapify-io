
# ETLP Data Mapping Studio

A modern, web-based UI for creating and managing data mappings and transformations using the ETLP ecosystem and Jute.clj transformation engine.

## Overview

ETLP Data Mapping Studio is a visual interface that simplifies data transformation workflows by providing a low-code environment for creating, testing, and managing data mappings. Built as part of the ETLP (Efficient Data Processing in Clojure) ecosystem, it leverages Jute.clj for powerful data transformation capabilities while offering an intuitive web interface for business users and developers alike.

## Key Features

- **Visual Mapping Editor**: Create and edit data transformations using YAML-based mapping rules
- **Live Preview**: Test mappings with real sample data and see results instantly
- **Version History**: Track changes to mappings with full versioning support
- **Sample Data Management**: Manage test datasets for validation and development
- **Tag-based Organization**: Categorize and organize mappings with custom tags
- **Real-time Collaboration**: Share and collaborate on mapping configurations
- **Format Support**: Work with JSON and YAML data formats seamlessly

## Architecture

This application serves as the UI layer for:
- **ETLP**: Clojure library for parallel data processing using transducers and CSP patterns
- **Jute.clj**: Data transformation engine for mapping business logic
- **Backend API**: RESTful service for mapping persistence and transformation execution

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- ETLP backend API running (see [API Integration Guide](docs/api-integration.md))

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint in `src/config/constants.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: "http://your-etlp-api:3031", // Update with your API URL
  // ...
};
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Documentation

- [Quick Start Guide](docs/quick-start.md) - Detailed setup instructions
- [User Guide](docs/user-guide.md) - How to use the mapping interface
- [API Integration](docs/api-integration.md) - Backend integration details
- [Architecture](docs/architecture.md) - Technical architecture overview
- [Development Guide](docs/development.md) - Contributing and development setup

## ETLP Integration

This UI integrates with the broader ETLP ecosystem:

- **ETLP Core**: Handles parallel data processing and connector management
- **etlp-mapper**: Decouples data mapping logic from application code
- **Jute.clj**: Provides the transformation engine for executing mappings

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Code Editor**: CodeMirror
- **Build Tool**: Vite
- **State Management**: TanStack Query

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the ETLP ecosystem. See the LICENSE file for details.

## Support

- [Documentation](docs/)
- [Issues](https://github.com/your-org/etlp-data-mapping-studio/issues)
- [ETLP Community](https://github.com/your-org/etlp)
