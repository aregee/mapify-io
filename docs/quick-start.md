
# Quick Start Guide

Get ETLP Data Mapping Studio up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** for cloning the repository
- **Keycloak** (v21 or higher) - [Download here](https://www.keycloak.org/downloads)
- **ETLP Backend API** - See [Backend Setup](#backend-setup) below

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Keycloak OIDC Configuration
VITE_OIDC_ISSUER=http://localhost:8080/realms/mapify
VITE_OIDC_CLIENT_ID=mapify-studio

# API Configuration  
VITE_API_BASE=http://localhost:3031
```

### 4. Keycloak Setup

1. **Start Keycloak** (if not already running):
   ```bash
   # Using Keycloak standalone
   ./bin/kc.sh start-dev --http-port=8080
   
   # Or using Docker
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. **Access Keycloak Admin Console**:
   - Go to `http://localhost:8080/admin`
   - Login with admin credentials

3. **Create Realm**:
   - Click "Create Realm"
   - Name: `mapify`
   - Click "Create"

4. **Create Client**:
   - In the `mapify` realm, go to "Clients"
   - Click "Create client"
   - Client ID: `mapify-studio`
   - Client type: `OpenID Connect`
   - Click "Next" and "Save"

5. **Configure Client**:
   - In client settings, set:
     - Valid redirect URIs: `http://localhost:5173/*`
     - Web origins: `http://localhost:5173`
     - Access Type: `public`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. You'll be redirected to Keycloak for authentication on first access.

## Backend Setup

### Option 1: Using Docker (Recommended)

If you have a Docker setup for your ETLP backend:

```bash
# Start your ETLP backend services
docker-compose up etlp-api
```

### Option 2: Local ETLP Development

1. Set up your ETLP Clojure project
2. Ensure the API server is running on port 3031 (or update the config)
3. Verify the `/mappings` endpoint is accessible

### API Verification

Test your backend connection:

```bash
curl http://localhost:3031/mappings
```

You should receive a JSON response with your mappings data.

## First Steps

### 1. Create Your First Mapping

1. Open the application at `http://localhost:5173`
2. Click "Create New Mapping"
3. Enter a title (e.g., "User Data Transform")
4. Add some tags (e.g., "users", "transformation")
5. Click "Create Mapping"

### 2. Add Transformation Logic

1. In the YAML editor, add your Jute.clj transformation rules:

```yaml
transform:
  - field: "user_name"
    from: "$.firstName"
    concat: 
      - "$.firstName"
      - " "
      - "$.lastName"
  - field: "email"
    from: "$.emailAddress"
    validate: "email"
```

2. Save your changes

### 3. Test with Sample Data

1. Click "Add Sample Data"
2. Enter test JSON data:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com"
}
```

3. Click "Test Transform" to see the results

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory. You can serve these with any static file server.

### Deployment Options

- **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
- **Docker**: Use the included Dockerfile
- **Traditional Web Server**: Serve the `dist/` folder with nginx, Apache, etc.

## Troubleshooting

### Common Issues

**API Connection Failed**
- Verify your backend is running
- Check the API URL in `src/config/constants.ts`
- Ensure CORS is configured on your backend

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`

**Port Already in Use**
- The dev server will automatically find an available port
- Or specify a port: `npm run dev -- --port 3000`

### Getting Help

- Check the [User Guide](user-guide.md) for feature documentation
- Review [API Integration](api-integration.md) for backend issues
- Search [GitHub Issues](https://github.com/your-org/etlp-data-mapping-studio/issues)

## Next Steps

- Read the [User Guide](user-guide.md) to learn about all features
- Explore [API Integration](api-integration.md) for advanced backend setup
- Check out the [Architecture Guide](architecture.md) to understand the system design
