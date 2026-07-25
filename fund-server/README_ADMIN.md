# Admin Role Management System

## Overview

This system implements a secure role-based access control where:

1. **Regular Users**: All registrations automatically create accounts with `"user"` role
2. **Admin Accounts**: Can only be created by superadmin (2-3 specific accounts)
3. **Superadmin Accounts**: Limited to maximum 3 accounts, controlled by superadmin

## Role Hierarchy

```
user < admin < superadmin
```

## Registration

### Public Registration (`POST /api/auth/register`)

- **Access**: Public (no authentication required)
- **Role Created**: Always `"user"` (forced, cannot be changed)
- **Body**: Regular registration data (email, name, password, etc.)
- **Note**: Any `role` field in request is ignored and set to `"user"`

### Admin User Creation (`POST /api/auth/admin/create-user`)

- **Access**: Admin or Superadmin only
- **Role Created**: Always `"user"` (even admins cannot create other admins)
- **Purpose**: Allows admins to create regular user accounts

## Admin Management (Superadmin Only)

### Create Admin Account (`POST /api/users/admin/create`)

- **Access**: Superadmin only
- **Auth Required**: Bearer token with superadmin role
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "securePassword123",
    "role": "admin" // or "superadmin" (max 3)
  }
  ```
- **Restrictions**:
  - Maximum 3 superadmin accounts
  - Only superadmin can create admin/superadmin accounts

### Update User Role (`PATCH /api/users/:id/role`)

- **Access**: Superadmin only
- **Body**:
  ```json
  {
    "role": "admin" // or "user" or "superadmin"
  }
  ```
- **Restrictions**:
  - Cannot promote to superadmin if 3 superadmins already exist
  - Can change existing superadmin (doesn't count as new)

### List Admin Users (`GET /api/users/admin/list`)

- **Access**: Superadmin only
- **Returns**: List of all admin and superadmin users

## Creating Initial Superadmin Accounts

### Option 1: Using Script (Recommended)

```bash
npm run create-superadmin
```

This interactive script will:

- Prompt for 2-3 superadmin account details
- Validate and create accounts
- Show summary of created accounts

### Option 2: Direct Database (Development Only)

For development, you can insert directly into database:

```sql
INSERT INTO users (email, name, password, role)
VALUES (
  'superadmin@example.com',
  'Super Admin',
  '$2b$10$...',  -- Hashed password
  'superadmin'
);
```

### Option 3: API Call (After First Superadmin)

Once you have at least one superadmin:

```bash
curl -X POST http://localhost:3001/api/users/admin/create \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@example.com",
    "name": "Admin 2",
    "password": "securePassword",
    "role": "superadmin"
  }'
```

## Security Features

1. **Role Enforcement**: Registration always creates `"user"` role
2. **Role Update Protection**: Cannot update role through regular user update endpoint
3. **Superadmin Limit**: Maximum 3 superadmin accounts enforced
4. **Access Control**: All admin management endpoints require superadmin authentication
5. **Double Validation**: Both guard and explicit checks prevent unauthorized access

## API Endpoints Summary

| Endpoint                      | Method | Auth   | Role Required    | Creates Role         |
| ----------------------------- | ------ | ------ | ---------------- | -------------------- |
| `/api/auth/register`          | POST   | None   | None             | `user`               |
| `/api/auth/admin/create-user` | POST   | Bearer | admin/superadmin | `user`               |
| `/api/users/admin/create`     | POST   | Bearer | superadmin       | `admin`/`superadmin` |
| `/api/users/:id/role`         | PATCH  | Bearer | superadmin       | N/A (updates)        |
| `/api/users/admin/list`       | GET    | Bearer | superadmin       | N/A                  |

## Example Workflow

1. **Initial Setup**:

   ```bash
   # Create first 2-3 superadmins
   npm run create-superadmin
   ```

2. **Create Admin Account** (as superadmin):

   ```bash
   POST /api/users/admin/create
   {
     "email": "admin@example.com",
     "name": "Admin User",
     "password": "password123",
     "role": "admin"
   }
   ```

3. **Promote User to Admin** (as superadmin):
   ```bash
   PATCH /api/users/{userId}/role
   {
     "role": "admin"
   }
   ```

## Important Notes

- ⚠️ **Never expose superadmin credentials**
- ⚠️ **Regular registration cannot create admin accounts**
- ⚠️ **Maximum 3 superadmin accounts is enforced**
- ⚠️ **Role cannot be changed through regular user update endpoint**
