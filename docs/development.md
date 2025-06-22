
# Development Guide

Complete guide for contributing to and developing ETLP Data Mapping Studio.

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **VSCode** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

### Initial Setup

1. **Clone and Install**:
```bash
git clone <repository-url>
cd etlp-data-mapping-studio
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env.local
# Edit .env.local with your development settings
```

3. **Start Development Server**:
```bash
npm run dev
```

4. **Verify Setup**:
   - Open `http://localhost:5173`
   - Verify the application loads correctly
   - Check browser console for errors

## Project Structure

### Directory Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Custom components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── config/              # Application configuration
└── lib/                 # Third-party library configurations

docs/                    # Documentation
public/                  # Static assets
```

### Component Organization

#### Naming Conventions
- **Components**: PascalCase (`CreateMapping.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMapping.ts`)
- **Utilities**: camelCase (`formatConverter.ts`)
- **Types**: PascalCase interfaces (`MappingData`)

#### File Structure
```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from './types';

interface LocalProps {
  // Component-specific props
}

const ComponentName: React.FC<LocalProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default ComponentName;
export type { LocalProps as ComponentNameProps };
```

## Development Standards

### Code Style

#### TypeScript
```typescript
// Use explicit types for props and state
interface MappingEditorProps {
  mapping: Mapping;
  onSave: (mapping: Mapping) => void;
  readonly?: boolean;
}

// Use proper error handling
const handleSave = async (data: MappingData) => {
  try {
    await saveMappingMutation.mutateAsync(data);
    toast({ title: "Mapping saved successfully" });
  } catch (error) {
    console.error("Save failed:", error);
    toast({ 
      title: "Save failed", 
      description: "Please try again",
      variant: "destructive" 
    });
  }
};
```

#### React Patterns
```typescript
// Use custom hooks for complex logic
const useMapping = (id: number) => {
  return useQuery({
    queryKey: ['mapping', id],
    queryFn: () => fetchMapping(id),
    enabled: !!id,
  });
};

// Memoize expensive computations
const transformedData = useMemo(() => {
  return transformData(sampleData, yamlRules);
}, [sampleData, yamlRules]);

// Use callback refs for dynamic elements
const editorRef = useCallback((node: HTMLElement | null) => {
  if (node) {
    // Initialize editor
  }
}, []);
```

### State Management

#### TanStack Query Best Practices
```typescript
// Query key factories
export const mappingKeys = {
  all: ['mappings'] as const,
  lists: () => [...mappingKeys.all, 'list'] as const,
  list: (filters: string) => [...mappingKeys.lists(), { filters }] as const,
  details: () => [...mappingKeys.all, 'detail'] as const,
  detail: (id: number) => [...mappingKeys.details(), id] as const,
};

// Mutation patterns
const updateMappingMutation = useMutation({
  mutationFn: updateMapping,
  onSuccess: (data, variables) => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: mappingKeys.detail(variables.id) });
    queryClient.invalidateQueries({ queryKey: mappingKeys.lists() });
  },
  onError: (error) => {
    console.error('Update failed:', error);
    toast({ title: "Update failed", variant: "destructive" });
  },
});
```

#### Local State Patterns
```typescript
// Form state with validation
const [formData, setFormData] = useState<CreateMappingRequest>({
  title: '',
  content: { tags: [], yaml: '', test_data: [] }
});

const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (data: CreateMappingRequest): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  if (!data.title.trim()) {
    newErrors.title = 'Title is required';
  }
  
  return newErrors;
};
```

## Component Development

### Creating New Components

1. **Create Component File**:
```typescript
// src/components/NewComponent.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button onClick={onAction} className="mt-2">
        Action
      </Button>
    </div>
  );
};

export default NewComponent;
export type { NewComponentProps };
```

2. **Add to Exports** (if needed):
```typescript
// src/components/index.ts
export { default as NewComponent } from './NewComponent';
export type { NewComponentProps } from './NewComponent';
```

### Component Guidelines

#### Accessibility
```typescript
// Use proper ARIA labels
<button
  aria-label="Delete mapping"
  aria-describedby="delete-help-text"
  onClick={handleDelete}
>
  <TrashIcon />
</button>

// Include helpful descriptions
<p id="delete-help-text" className="sr-only">
  This action cannot be undone
</p>
```

#### Performance
```typescript
// Memoize components when appropriate
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => processData(data), [data]);
  
  return <div>{/* Render processed data */}</div>;
});

// Use lazy loading for large components
const LazyEditor = lazy(() => import('./CodeEditor'));
```

## API Integration

### Creating API Functions

```typescript
// src/api/mappings.ts
import { API_CONFIG } from '@/config/constants';
import { Mapping, CreateMappingRequest } from '@/types/mapping';

export const fetchMappings = async (): Promise<Mapping[]> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mappings: ${response.statusText}`);
  }
  
  return response.json();
};

export const createMapping = async (data: CreateMappingRequest): Promise<Mapping> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MAPPINGS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create mapping: ${errorText}`);
  }
  
  return response.json();
};
```

### Error Handling Patterns

```typescript
// Centralized error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText, response.status, response);
  }
  return response;
};
```

## Testing

### Testing Setup

```bash
# Install testing dependencies (if not already included)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Unit Testing

```typescript
// src/components/__tests__/CreateMapping.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateMapping from '../CreateMapping';

describe('CreateMapping', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  it('renders the dialog when open', () => {
    render(<CreateMapping {...mockProps} />);
    
    expect(screen.getByText('Create New Mapping')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('calls onSuccess when form is submitted successfully', async () => {
    render(<CreateMapping {...mockProps} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Mapping' }
    });
    
    fireEvent.click(screen.getByText('Create Mapping'));
    
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Integration Testing

```typescript
// src/__tests__/MappingWorkflow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Mapping Workflow', () => {
  it('allows creating and editing a mapping', async () => {
    renderWithProviders(<App />);
    
    // Create mapping
    fireEvent.click(screen.getByText('Create New Mapping'));
    // ... test workflow
  });
});
```

### Testing Utilities

```typescript
// src/test/utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export { customRender as render, createTestQueryClient };
```

## Debugging

### Development Tools

#### Browser DevTools
- **React DevTools**: Component tree inspection
- **Network Tab**: API request monitoring
- **Console**: Error logging and debugging

#### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Debugging Techniques

#### Console Logging
```typescript
// Structured logging
const debugMapping = (mapping: Mapping, action: string) => {
  console.group(`🗺️ Mapping ${action}`);
  console.log('ID:', mapping.id);
  console.log('Title:', mapping.title);
  console.log('Content:', mapping.content);
  console.groupEnd();
};

// Performance monitoring
const measurePerformance = (fn: Function, label: string) => {
  return (...args: any[]) => {
    console.time(label);
    const result = fn(...args);
    console.timeEnd(label);
    return result;
  };
};
```

#### Error Tracking
```typescript
// Enhanced error logging
const logError = (error: Error, context: Record<string, any>) => {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
};
```

## Building and Deployment

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Build Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze
```

#### Performance Optimization
```typescript
// Code splitting
const LazyComponent = lazy(() => 
  import('./HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);

// Preload critical resources
const preloadCriticalData = () => {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery({
    queryKey: mappingKeys.lists(),
    queryFn: fetchMappings,
  });
};
```

### Deployment Checklist

- [ ] **Environment Variables**: Configure production API endpoints
- [ ] **Error Monitoring**: Set up error tracking (Sentry, etc.)
- [ ] **Performance Monitoring**: Configure performance tracking
- [ ] **Security Headers**: Implement CSP and other security headers
- [ ] **Caching**: Configure proper cache headers
- [ ] **Compression**: Enable gzip/brotli compression
- [ ] **HTTPS**: Ensure secure connections
- [ ] **Testing**: Run full test suite
- [ ] **Documentation**: Update deployment documentation

## Contributing

### Pull Request Process

1. **Create Feature Branch**:
```bash
git checkout -b feature/new-feature-name
```

2. **Make Changes**:
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit Changes**:
```bash
git add .
git commit -m "feat: add new feature description"
```

4. **Push and Create PR**:
```bash
git push origin feature/new-feature-name
# Create pull request via GitHub/GitLab interface
```

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
- `feat(mapping): add YAML validation`
- `fix(api): handle network errors properly`
- `docs(readme): update installation instructions`

### Code Review Guidelines

#### For Authors
- Write clear commit messages
- Include tests for new features
- Update documentation
- Keep PRs focused and reasonably sized

#### For Reviewers
- Check for code quality and standards
- Verify tests are comprehensive
- Ensure documentation is updated
- Test functionality locally when needed

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf .tsbuildinfo

# Reset development server
npm run dev -- --force
```

#### Type Errors
```typescript
// Check type definitions
npm run type-check

// Update type dependencies
npm update @types/react @types/node
```

#### Performance Issues
```typescript
// Use React DevTools Profiler
// Check for unnecessary re-renders
// Optimize with memo, useMemo, useCallback

// Monitor bundle size
npm run build -- --analyze
```

### Getting Help

- **Documentation**: Check this guide and API docs
- **Issues**: Search existing GitHub issues
- **Community**: Join the ETLP community discussions
- **Stack Overflow**: Tag questions with `etlp` and `react`
