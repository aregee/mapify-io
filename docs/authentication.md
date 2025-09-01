# Authentication Guide

The ETLP Data Mapping Studio uses Keycloak for authentication and authorization through the OpenID Connect (OIDC) protocol.

## Overview

The application integrates with Keycloak to provide:
- **Single Sign-On (SSO)**: Users authenticate once with Keycloak
- **Token-based Security**: JWT tokens secure API communications
- **Role-based Access**: Keycloak roles can control feature access
- **Session Management**: Automatic token refresh and logout

## Configuration

### Environment Variables

Set the following environment variables in your `.env.local` file:

```env
VITE_OIDC_ISSUER=http://localhost:8080/realms/mapify
VITE_OIDC_CLIENT_ID=mapify-studio
VITE_API_BASE=http://localhost:3031
```

### Keycloak Realm Setup

1. **Create Realm**:
   - Access Keycloak Admin Console
   - Create a new realm named `mapify`

2. **Create Client**:
   - Client ID: `mapify-studio`
   - Client Protocol: `openid-connect`
   - Access Type: `public`

3. **Configure Client Settings**:
   ```
   Valid Redirect URIs: http://localhost:8080/*
   Web Origins: http://localhost:8080
   Standard Flow Enabled: ON
   Direct Access Grants Enabled: ON (optional)
   ```

## Authentication Flow

### 1. Initial Access
- User accesses the application
- If not authenticated, redirected to Keycloak login
- After successful login, returned to application with tokens

### 2. API Requests
- All API requests include JWT access token in Authorization header
- Format: `Authorization: Bearer <access_token>`

### 3. Token Management
- Automatic token refresh before expiration
- Silent renewal in background
- Logout clears all tokens and sessions

## Implementation Details

### Components

#### AuthProvider
Wraps the entire application with OIDC context:
```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

#### ProtectedRoute
Protects routes requiring authentication:
```tsx
<ProtectedRoute>
  <MappingsList />
</ProtectedRoute>
```

#### UserProfile
Displays user information and logout option in the header.

### Hooks

#### useAuth
Provides authentication state and methods:
```tsx
const { isAuthenticated, user, signIn, signOut } = useAuth();
```

### API Integration

The `ApiService` class automatically includes authentication tokens:
```tsx
const { apiService } = useApi();
const mappings = await apiService.get('/mappings');
```

## Security Considerations

### Token Security
- Access tokens are stored in memory only
- No sensitive data in localStorage
- Automatic token cleanup on logout

### HTTPS Requirements
For production deployments:
- Use HTTPS for both application and Keycloak
- Update redirect URIs accordingly
- Configure proper CORS settings

### Error Handling
- 401 responses trigger re-authentication
- Network errors show user-friendly messages
- Graceful degradation for authentication failures

## Troubleshooting

### Common Issues

1. **Redirect Loop**:
   - Check Valid Redirect URIs in Keycloak
   - Verify OIDC issuer URL is correct

2. **CORS Errors**:
   - Configure Web Origins in Keycloak client
   - Ensure proper domain configuration

3. **Token Expiry**:
   - Check token lifetime settings in Keycloak
   - Verify automatic renewal is working

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.debug = 'oidc-client-ts:*';
```

## Production Deployment

### Environment Configuration
Update environment variables for production:
```env
VITE_OIDC_ISSUER=https://your-keycloak.domain.com/realms/mapify
VITE_OIDC_CLIENT_ID=mapify-studio
VITE_API_BASE=https://your-api.domain.com
```

### Keycloak Configuration
- Use HTTPS for all URLs
- Configure proper redirect URIs
- Set up SSL certificates
- Configure realm security settings

### Security Headers
Implement proper security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options