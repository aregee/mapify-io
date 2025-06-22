
# API Integration Guide

Complete guide for integrating ETLP Data Mapping Studio with your backend API and ETLP ecosystem.

## Overview

This guide covers the backend API requirements, ETLP integration patterns, and deployment considerations for the Data Mapping Studio.

## Backend API Requirements

### Required Endpoints

The application expects the following REST endpoints:

#### Mappings Management

**GET /mappings**
- Returns list of all mappings
- Response: Array of mapping objects

**GET /mappings/{id}**
- Returns specific mapping by ID
- Response: Single mapping object

**POST /mappings**
- Creates new mapping
- Request body: CreateMappingRequest
- Response: 201 Created with Location header

**PUT /mappings/{id}**
- Updates existing mapping
- Request body: Complete mapping object
- Response: Updated mapping object

**DELETE /mappings/{id}**
- Deletes mapping
- Response: 204 No Content

#### History Management

**GET /mappings/{id}/_history**
- Returns version history for mapping
- Response: Array of historical versions

**GET /mappings/{id}/_history/{version}**
- Returns specific historical version
- Response: Historical mapping object

### Data Models

#### Mapping Object

```json
{
  "id": 123,
  "title": "User Data Transformation",
  "content": {
    "tags": ["users", "api", "normalization"],
    "yaml": "transform:\n  - field: \"full_name\"\n    from: \"$.name\"",
    "test_data": [
      {
        "id": "sample1",
        "name": "Valid User",
        "data": "{\"name\": \"John Doe\"}",
        "isYaml": false
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z",
  "href": "/mappings/123"
}
```

#### CreateMappingRequest

```json
{
  "title": "New Mapping",
  "content": {
    "tags": ["tag1", "tag2"],
    "yaml": "",
    "test_data": []
  }
}
```

## ETLP Integration

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web UI        │    │   Backend API    │    │   ETLP Core     │
│   (This App)    │◄──►│   (Your API)     │◄──►│   (Clojure)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────────┐    ┌─────────────────┐
                        │   Database       │    │   Jute.clj      │
                        │   (Mappings)     │    │   (Transform)   │
                        └──────────────────┘    └─────────────────┘
```

### ETLP Core Integration

#### Mapping Execution

Your ETLP backend should:

1. **Store Mappings**: Persist mapping configurations in your database
2. **Execute Transformations**: Use Jute.clj to execute the YAML transformation rules
3. **Handle Data Flow**: Integrate with ETLP's data pipeline processors

#### Sample Integration Code (Clojure)

```clojure
(ns your-app.mapping-api
  (:require [jute.core :as jute]
            [etlp.core :as etlp]))

(defn execute-mapping [mapping-config input-data]
  "Execute a mapping transformation using Jute.clj"
  (let [yaml-rules (:yaml (:content mapping-config))
        transform-fn (jute/compile-transformation yaml-rules)]
    (transform-fn input-data)))

(defn create-etlp-processor [mapping-id]
  "Create an ETLP processor using the mapping"
  (etlp/processor
    {:transform-fn (fn [data]
                     (let [mapping (get-mapping-by-id mapping-id)]
                       (execute-mapping mapping data)))}))
```

### Jute.clj Transformations

#### Transformation Engine

The YAML rules created in the UI are executed by Jute.clj:

**Example YAML**:
```yaml
transform:
  - field: "user_id"
    from: "$.id"
  - field: "full_name"
    concat:
      - "$.first_name"
      - " "
      - "$.last_name"
  - field: "email"
    from: "$.email_address"
    validate: "email"
```

**Jute.clj Execution**:
```clojure
(defn apply-transformation [yaml-rules input-data]
  (let [compiled-transform (jute/compile yaml-rules)]
    (compiled-transform input-data)))
```

#### Supported Transformations

- **Field Mapping**: Direct field copying and renaming
- **Concatenation**: Joining multiple fields
- **Validation**: Data type and format validation
- **Conditional Logic**: If/then/else transformations
- **Data Type Conversion**: String to number, date parsing, etc.
- **Nested Object Handling**: Complex object transformations

## Data Connectors

### Source Processors

ETLP source processors feed data into your transformations:

```clojure
(defn database-source [query]
  (etlp/source
    {:fetch-fn (fn [] (execute-query query))
     :transform-mapping-id 123}))

(defn api-source [endpoint]
  (etlp/source
    {:fetch-fn (fn [] (http-get endpoint))
     :transform-mapping-id 456}))
```

### Destination Processors

Transformed data flows to destination processors:

```clojure
(defn database-destination [table]
  (etlp/destination
    {:write-fn (fn [transformed-data]
                 (insert-into-table table transformed-data))}))

(defn api-destination [endpoint]
  (etlp/destination
    {:write-fn (fn [transformed-data]
                 (http-post endpoint transformed-data))}))
```

## Configuration

### Environment Variables

Configure your backend API connection:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3031
VITE_API_TIMEOUT=30000
```

### API Configuration

Update `src/config/constants.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || "http://localhost:3031",
  ENDPOINTS: {
    MAPPINGS: "/mappings",
  },
  TIMEOUT: parseInt(process.env.VITE_API_TIMEOUT || "30000"),
};
```

## CORS Configuration

Your backend must allow cross-origin requests:

### Express.js Example

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}));
```

### Spring Boot Example

```java
@CrossOrigin(origins = {"http://localhost:5173", "https://your-domain.com"})
@RestController
public class MappingController {
    // Your endpoints
}
```

## Authentication & Security

### JWT Integration

If using JWT authentication:

```typescript
// Add to API requests
const token = localStorage.getItem('authToken');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### API Security Best Practices

- **Authentication**: Secure all endpoints with proper authentication
- **Authorization**: Implement role-based access control
- **Validation**: Validate all input data on the backend
- **Rate Limiting**: Prevent abuse with request rate limiting

## Error Handling

### Expected Error Responses

The UI handles these error scenarios:

**400 Bad Request**:
```json
{
  "error": "Invalid mapping configuration",
  "details": "YAML syntax error on line 5"
}
```

**404 Not Found**:
```json
{
  "error": "Mapping not found",
  "mapping_id": 123
}
```

**500 Internal Server Error**:
```json
{
  "error": "Transformation execution failed",
  "details": "Invalid JSONPath expression"
}
```

## Performance Considerations

### Caching

Implement caching for:
- **Mapping Lists**: Cache frequently accessed mapping lists
- **Compiled Transformations**: Cache Jute.clj compiled transformations
- **Validation Results**: Cache transformation validation results

### Optimization

- **Pagination**: Implement pagination for large mapping lists
- **Lazy Loading**: Load mapping content only when needed
- **Background Processing**: Execute complex transformations asynchronously

## Deployment

### Production Checklist

- [ ] Configure production API endpoints
- [ ] Set up proper CORS policies  
- [ ] Implement authentication/authorization
- [ ] Configure error monitoring
- [ ] Set up database connections
- [ ] Test ETLP integration
- [ ] Monitor transformation performance

### Docker Deployment

Example Docker setup:

```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

For detailed deployment instructions, see the [Development Guide](development.md).
