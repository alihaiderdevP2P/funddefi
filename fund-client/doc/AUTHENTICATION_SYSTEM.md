# Authentication System Documentation

## Overview

The crowdfunding platform now includes a comprehensive role-based authentication system with three user roles:

- **User**: Regular users who can create campaigns and fund projects
- **Admin**: Administrators who can manage campaigns and moderate content
- **Super Admin**: Super administrators with full platform access

## Features

### 🔐 Authentication Features

- JWT-based authentication with secure token management
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Protected routes and API endpoints
- Session management with localStorage
- WebSocket authentication integration

### 👥 User Roles & Permissions

#### User Role

- Create and manage campaigns
- Fund campaigns
- Access personal dashboard
- View all public campaigns
- Manage personal profile

#### Admin Role

- All user permissions
- Access admin dashboard
- Moderate campaigns
- Manage user accounts
- View platform analytics
- Approve/reject campaigns

#### Super Admin Role

- All admin permissions
- Full platform management
- System configuration
- User role management
- Complete analytics access

## Implementation Details

### Backend Implementation

#### Database Schema

```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

-- Users table with role column
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    avatar VARCHAR(500),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Authentication Service

- JWT token generation with role information
- Password validation and hashing
- User profile management
- Role-based access control

#### Guards and Decorators

- `JwtAuthGuard`: Validates JWT tokens
- `RolesGuard`: Enforces role-based permissions
- `@Roles()` decorator: Specifies required roles for endpoints

### Frontend Implementation

#### Authentication Hook (`useAuth`)

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
```

#### Role-Based Components

- `RoleAuthGuard`: Protects routes based on user roles
- `UserNavigation`: Displays user info and role-based navigation
- `AuthGuard`: Basic authentication protection

## User Experience Flow

### For New Users

1. Visit `/create` → See authentication prompt
2. Click "Create Account" → Fill registration form
3. Account created → Automatically logged in
4. Redirected to campaigns page
5. Can now create campaigns

### For Existing Users

1. Visit `/create` → See authentication prompt
2. Click "Sign In" → Enter credentials
3. Logged in → Redirected to campaigns page
4. Can now create campaigns

### For Authenticated Users

- See welcome message with their name
- Have logout option available
- Can access create page directly
- Campaigns created are associated with their account
- Role-based navigation (Admin panel for admins)

## Available Routes

### Public Routes

- `/` - Home page
- `/campaigns` - Campaign listing (shows auth options)
- `/login` - User login page
- `/register` - User registration page

### Protected Routes (Requires Authentication)

- `/dashboard` - User dashboard (user role)
- `/create` - Campaign creation (user role)
- `/admin` - Admin dashboard (admin/superadmin role)

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/admin/create-user` - Create user (admin only)

### Protected Endpoints

All campaign and funding endpoints now require authentication and include role-based access control.

## Security Features

### Password Security

- Passwords are hashed using bcrypt with salt rounds
- Minimum password length validation
- Password confirmation on registration

### Token Security

- JWT tokens include role information
- Tokens expire after 7 days (configurable)
- Automatic token refresh handling
- Secure token storage in localStorage

### Role-Based Security

- API endpoints protected by role guards
- Frontend routes protected by role-based components
- Admin actions require appropriate permissions

## Database Migration

If you have an existing database, run the migration script:

```bash
cd backend
./run-migration.sh
```

This will:

- Add the `role` column to the users table
- Set all existing users to 'user' role by default
- Create necessary indexes for performance

## Configuration

### Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Default Roles

- New users are assigned 'user' role by default
- Admin and superadmin roles must be assigned manually
- Role changes require appropriate permissions

## Testing the System

### Test User Roles

1. Register a new user (gets 'user' role)
2. Create campaigns as a user
3. Access admin panel (should be denied for regular users)
4. Manually update a user's role in the database to 'admin'
5. Access admin panel (should work for admin users)

### Test Authentication Flow

1. Try to access `/create` without authentication
2. Register/login and verify automatic redirect
3. Test logout functionality
4. Verify session persistence across page refreshes

## Troubleshooting

### Common Issues

1. **Role not showing**: Ensure the database migration was run
2. **Authentication errors**: Check JWT_SECRET environment variable
3. **Permission denied**: Verify user has correct role for the action
4. **Token expired**: Check token expiration settings

### Debug Steps

1. Check browser localStorage for auth_token and user_data
2. Verify JWT token payload includes role information
3. Check backend logs for authentication errors
4. Verify database has role column and data

## Future Enhancements

- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub, etc.)
- Role inheritance and custom permissions
- Audit logging for admin actions
- Email verification for new accounts
- Password reset functionality
