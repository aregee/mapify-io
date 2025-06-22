
# Architecture Guide

Technical architecture and design decisions for ETLP Data Mapping Studio.

## System Overview

ETLP Data Mapping Studio is a React-based web application that provides a visual interface for creating and managing data transformations within the ETLP ecosystem.

```
┌─────────────────────────────────────────────────────────────┐
│                    ETLP Data Mapping Studio                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React UI  │  │  State Mgmt │  │    Code Editor      │  │
│  │   (shadcn)  │  │ (TanStack)  │  │   (CodeMirror)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Routing   │  │   API Comm  │  │   Format Utils      │  │
│  │ (React Router│  │   (Fetch)   │  │   (YAML/JSON)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   REST API  │  │  Database   │  │      ETLP Core      │  │
│  │             │  │  (Mappings) │  │   (Clojure/CSP)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Jute.clj   │  │ Data Sources│  │   Destinations      │  │
│  │ (Transform) │  │ (Connectors)│  │   (Processors)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── CreateMapping.tsx   # Mapping creation dialog
│   ├── DataMapper.tsx      # Main mapping interface
│   ├── Editor.tsx          # YAML/JSON editor wrapper
│   └── CodeEditor.tsx      # CodeMirror integration
├── pages/
│   ├── Index.tsx           # Home/dashboard page
│   ├── MappingsList.tsx    # Mappings list view
│   ├── MappingHistory.tsx  # Version history view
│   └── NotFound.tsx        # 404 error page
├── types/
│   ├── mapping.ts          # Mapping-related types
│   └── data-mapper.ts      # Data transformation types
├── utils/
│   └── format-converter.ts # JSON/YAML conversion
├── config/
│   └── constants.ts        # Application configuration
└── hooks/                  # Custom React hooks
```

### Design Patterns

#### Component Composition
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Pure UI components with props
- **Compound Components**: Complex components built from smaller parts

#### State Management
- **TanStack Query**: Server state management and caching
- **React State**: Local component state for UI interactions
- **URL State**: Route-based state for navigation and deep linking

#### Error Boundaries
- **Component-level**: Isolated error handling for critical sections
- **Global Handler**: Application-wide error catching and reporting
- **User Feedback**: Toast notifications for user-facing errors

### Key Technologies

#### React 18
- **Concurrent Features**: Improved performance and user experience
- **Suspense**: Loading states for async operations
- **Error Boundaries**: Graceful error handling

#### TypeScript
- **Type Safety**: Compile-time error checking
- **Interface Definitions**: Clear API contracts
- **Developer Experience**: Enhanced IDE support

#### Tailwind CSS
- **Utility-First**: Rapid UI development
- **Responsive Design**: Mobile-first approach
- **Custom Theming**: Consistent design system

#### shadcn/ui
- **Accessible Components**: WCAG compliant UI elements
- **Customizable**: Tailwind-based styling
- **Modern Design**: Contemporary interface patterns

## State Management

### TanStack Query Architecture

```typescript
// Query Key Structure
const queryKeys = {
  mappings: ['mappings'] as const,
  mapping: (id: number) => ['mappings', id] as const,
  mappingHistory: (id: number) => ['mappings', id, 'history'] as const,
};

// Query Definitions
const useMappingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.mappings,
    queryFn: fetchMappings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Caching Strategy

- **Stale-While-Revalidate**: Background updates for better UX
- **Optimistic Updates**: Immediate UI updates for mutations
- **Cache Invalidation**: Smart invalidation on data changes

### Local State Patterns

```typescript
// Form State
const [formData, setFormData] = useState<CreateMappingRequest>({
  title: '',
  content: { tags: [], yaml: '', test_data: [] }
});

// UI State
const [isEditing, setIsEditing] = useState(false);
const [selectedSample, setSelectedSample] = useState<string | null>(null);
```

## Code Editor Integration

### CodeMirror Architecture

```typescript
// Editor Configuration
const editorConfig = {
  extensions: [
    yaml(), // YAML language support
    json(), // JSON language support
    githubTheme, // Syntax highlighting theme
    EditorView.lineWrapping, // Line wrapping
  ],
  basicSetup: {
    lineNumbers: true,
    foldGutter: true,
    highlightSelectionMatches: true,
  }
};
```

### Real-time Features

- **Auto-save**: Debounced saving of editor content
- **Syntax Validation**: Real-time YAML/JSON validation
- **Format Conversion**: Seamless JSON ↔ YAML conversion

## Data Flow

### Mapping Lifecycle

```
Create → Edit → Test → Save → Deploy → Monitor
   ↓       ↓      ↓      ↓       ↓        ↓
   UI → Editor → Test → API → ETLP → Production
```

### API Integration Flow

```typescript
// Data Fetching
Query Cache ← API Response ← Backend ← Database
     ↓              ↓           ↓         ↓
   React      HTTP Request   REST API   Mapping
Component                               Storage

// Data Mutations
UI Action → Optimistic Update → API Call → Cache Update
    ↓              ↓               ↓           ↓
Component    Immediate UI      Backend    Sync State
 State        Response         Update
```

## Performance Optimizations

### Frontend Optimizations

#### Code Splitting
```typescript
// Route-based splitting
const MappingsList = lazy(() => import('@/pages/MappingsList'));
const MappingHistory = lazy(() => import('@/pages/MappingHistory'));

// Component-based splitting
const CodeEditor = lazy(() => import('@/components/CodeEditor'));
```

#### Memoization
```typescript
// Expensive computations
const transformedData = useMemo(() => 
  transformData(sampleData, yamlRules), 
  [sampleData, yamlRules]
);

// Component optimization
const MemoizedEditor = memo(CodeEditor);
```

#### Virtual Scrolling
- **Large Lists**: Virtualized mapping lists for performance
- **Editor Performance**: Efficient rendering of large YAML files

### Caching Strategy

#### Browser Caching
- **Static Assets**: Long-term caching for JS/CSS bundles
- **API Responses**: Strategic caching of mapping data
- **Local Storage**: Persistence of user preferences

#### Service Worker (Future)
- **Offline Support**: Basic functionality without network
- **Background Sync**: Sync changes when connection restored

## Security Considerations

### Frontend Security

#### Input Validation
```typescript
// Sanitize user input
const sanitizeYaml = (input: string): string => {
  // Remove potentially dangerous YAML constructs
  return input.replace(/!!python\/|!!js\/|!!\w+\//g, '');
};
```

#### XSS Prevention
- **Content Security Policy**: Restrict script execution
- **Input Sanitization**: Clean user-provided content
- **Safe HTML Rendering**: Use React's built-in protections

#### Data Protection
- **Sensitive Data**: Never log sensitive information
- **Local Storage**: Encrypt sensitive data if stored locally
- **Memory Management**: Clear sensitive data when not needed

## Error Handling

### Error Boundaries

```typescript
class MappingErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Mapping error:', error, errorInfo);
    
    // Show user-friendly error message
    toast({
      title: "Something went wrong",
      description: "Please try refreshing the page",
      variant: "destructive",
    });
  }
}
```

### API Error Handling

```typescript
// Centralized error handling
const handleApiError = (error: Error) => {
  if (error.name === 'NetworkError') {
    toast({
      title: "Connection Error",
      description: "Please check your internet connection",
      variant: "destructive",
    });
  } else if (error.message.includes('401')) {
    // Handle authentication errors
    redirectToLogin();
  } else {
    // Generic error handling
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
};
```

## Testing Strategy

### Testing Pyramid

```
┌─────────────────┐
│   E2E Tests     │  ← User workflows, critical paths
├─────────────────┤
│ Integration     │  ← Component + API interactions  
├─────────────────┤
│   Unit Tests    │  ← Individual functions, components
└─────────────────┘
```

### Test Categories

#### Unit Tests
- **Utility Functions**: Format conversion, validation
- **Components**: Individual component behavior
- **Hooks**: Custom hook logic

#### Integration Tests
- **API Integration**: Mocked API responses
- **Component Integration**: Multi-component workflows
- **State Management**: Query/mutation flows

#### E2E Tests
- **User Workflows**: Complete mapping creation flow
- **Cross-browser**: Compatibility testing
- **Performance**: Load time and interaction metrics

## Deployment Architecture

### Build Process

```
Source Code → TypeScript Compilation → Bundling → Optimization → Static Assets
     ↓              ↓                     ↓           ↓            ↓
   .ts/.tsx     JavaScript            Webpack      Minification   dist/
   Files         Modules               Bundle       Tree Shaking   Folder
```

### Deployment Options

#### Static Hosting
- **CDN Distribution**: Global content delivery
- **Cache Headers**: Optimal caching strategies
- **Compression**: Gzip/Brotli compression

#### Container Deployment
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Future Considerations

### Scalability
- **Component Federation**: Micro-frontend architecture
- **State Scaling**: Advanced state management patterns
- **Performance Monitoring**: Real-time performance tracking

### Feature Extensions
- **Collaboration**: Real-time collaborative editing
- **Versioning**: Advanced version control features
- **AI Integration**: AI-assisted mapping generation

### Technical Debt
- **Code Reviews**: Regular architecture reviews
- **Refactoring**: Planned technical debt reduction
- **Documentation**: Continuous documentation updates
