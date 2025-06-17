# User Management System - Complete Workflow Demonstration

## Overview
Complete staff and client creation system with automatic credential assignment and authentication flow for bail bond management.

## 1. Staff Creation Process

### API Endpoint: POST /api/admin/staff
Creates new staff member with automatic credential generation.

**Request Example:**
```json
{
  "firstName": "John",
  "lastName": "Smith", 
  "email": "john.smith@testbail.com",
  "position": "agent",
  "department": "operations",
  "phone": "(555) 123-4567",
  "hireDate": "2024-06-01",
  "salary": 50000
}
```

**Response Example:**
```json
{
  "staff": {
    "id": 1,
    "employeeId": "EMP-1734394179000",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@testbail.com",
    "position": "agent",
    "isActive": true
  },
  "credentials": {
    "username": "john.smith@testbail.com",
    "temporaryPassword": "a1b2c3d4",
    "activationToken": "token_1734394179001"
  }
}
```

### What Happens Automatically:
1. **Staff Record Created** - Complete employee profile
2. **Employee ID Generated** - Unique identifier (EMP-timestamp)
3. **Temporary Password Created** - 8-character random password
4. **Activation Token Generated** - 24-hour expiration
5. **User Credentials Stored** - Secure credential tracking

## 2. Client Creation Process

### API Endpoint: POST /api/admin/clients
Creates new client with portal access credentials.

**Request Example:**
```json
{
  "fullName": "Sarah Johnson",
  "email": "sarah.johnson@email.com",
  "phoneNumber": "(555) 987-6543",
  "address": "123 Main St",
  "city": "Honolulu",
  "state": "HI",
  "zipCode": "96814",
  "dateOfBirth": "1985-03-15",
  "emergencyContact": "Mike Johnson",
  "emergencyPhone": "(555) 111-2222"
}
```

**Response Example:**
```json
{
  "client": {
    "id": 1,
    "clientId": "CLT-1734394180000",
    "fullName": "Sarah Johnson",
    "email": "sarah.johnson@email.com",
    "accountStatus": "pending",
    "isActive": true
  },
  "credentials": {
    "clientId": "CLT-1734394180000",
    "username": "sarah.johnson@email.com",
    "temporaryPassword": "x9y8z7w6",
    "activationToken": "token_1734394180001",
    "portalUrl": "/client-portal/activate?token=token_1734394180001"
  }
}
```

### What Happens Automatically:
1. **Client Record Created** - Complete client profile
2. **Client ID Generated** - Unique identifier (CLT-timestamp)
3. **Portal Access Created** - Client portal credentials
4. **Activation Link Generated** - Direct portal activation URL
5. **Account Status Set** - Initial "pending" status

## 3. Staff Authentication Flow

### Step 1: Staff Login
- **URL:** `/staff-login`
- **Credentials:** Username + temporary password
- **First Login:** Requires password reset

### Step 2: Password Reset (if required)
- **Automatic Detection:** System detects temporary password
- **Password Requirements:** 8+ characters, secure format
- **Account Activation:** Permanent access granted

### Step 3: Staff Dashboard Access
- **Access Level:** Based on position (agent, manager, admin)
- **Permissions:** Role-based system access
- **Dashboard:** Full administrative capabilities

## 4. Client Portal Activation

### Step 1: Activation Link
- **Format:** `/client-portal/activate?token=TOKEN`
- **Validity:** 24 hours from creation
- **Security:** One-time use activation

### Step 2: Password Setup
- **Requirements:** 8+ characters with complexity rules
- **Validation:** Real-time password strength checking
- **Confirmation:** Double-entry verification

### Step 3: Portal Access
- **Login:** Email/Client ID + password
- **Features:** Check-in, payments, court dates, documents
- **Status:** Account activated and fully functional

## 5. Credential Management

### Password Reset Functionality
**API Endpoint:** POST /api/admin/reset-password
```json
{
  "username": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "temporaryPassword": "temp123",
  "activationToken": "new_token_456",
  "message": "Password reset successfully"
}
```

### Account Activation
**API Endpoint:** POST /api/admin/activate-account
```json
{
  "token": "activation_token",
  "newPassword": "securePassword123"
}
```

## 6. User Management Dashboard Features

### Staff Management Tab
- **Create Staff** - Complete employee onboarding
- **View All Staff** - Employee directory with status
- **Edit Staff** - Update employee information
- **Deactivate Staff** - Secure account suspension

### Client Management Tab
- **Create Client** - Client onboarding with portal setup
- **View All Clients** - Client directory with portal status
- **Edit Client** - Update client information
- **Portal Status** - Track activation and login activity

### Credentials Management Tab
- **View All Credentials** - System-wide credential overview
- **Reset Passwords** - Admin password reset capability
- **Account Status** - Active/inactive credential tracking
- **Login Activity** - Last login and activity monitoring

## 7. Security Features

### Password Security
- **Bcrypt Hashing** - Industry-standard password encryption
- **Temporary Passwords** - Auto-generated secure temporaries
- **Token Expiration** - 24-hour activation windows
- **Login Attempts** - Tracking and lockout protection

### Access Control
- **Role-Based Permissions** - Staff position-based access
- **Account Status Tracking** - Active/pending/suspended states
- **Audit Logging** - Complete credential activity history
- **Session Management** - Secure login session handling

## 8. Data Storage Structure

### Staff Records (staff.json)
```json
{
  "id": 1,
  "employeeId": "EMP-1734394179000",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@testbail.com",
  "position": "agent",
  "department": "operations",
  "phone": "(555) 123-4567",
  "isActive": true,
  "createdAt": "2024-12-16T20:22:59.000Z"
}
```

### Client Records (clients.json)
```json
{
  "id": 1,
  "clientId": "CLT-1734394180000",
  "fullName": "Sarah Johnson",
  "email": "sarah.johnson@email.com",
  "phoneNumber": "(555) 987-6543",
  "accountStatus": "pending",
  "isActive": true,
  "createdAt": "2024-12-16T20:23:00.000Z"
}
```

### User Credentials (user-credentials.json)
```json
{
  "id": 1,
  "username": "john.smith@testbail.com",
  "credentialType": "staff_access",
  "temporaryPassword": "hashed_password",
  "activationToken": "token_1734394179001",
  "activationTokenExpires": "2024-12-17T20:22:59.000Z",
  "passwordResetRequired": true,
  "isActive": true,
  "createdBy": "admin"
}
```

## 9. Frontend Implementation

### User Management Interface
- **Tabbed Interface** - Staff, Clients, Credentials sections
- **Form Validation** - Real-time input validation
- **Credential Display** - Secure credential presentation
- **Copy to Clipboard** - Easy credential sharing
- **Status Indicators** - Visual status representation

### Authentication Pages
- **Staff Login** - Professional staff authentication
- **Client Portal Activation** - User-friendly activation flow
- **Password Reset** - Secure password change process
- **Error Handling** - Clear error messages and guidance

## 10. Complete Workflow Summary

**Administrator Creates Staff Member:**
1. Fill out staff information form
2. System generates employee ID and credentials
3. Temporary password displayed to admin
4. Staff member receives login instructions

**Staff Member First Login:**
1. Use temporary username/password
2. System detects temporary password
3. Required to set new permanent password
4. Access granted to staff dashboard

**Administrator Creates Client:**
1. Fill out client information form
2. System generates client ID and portal credentials
3. Activation link created for client
4. Client receives portal access instructions

**Client Portal Activation:**
1. Client clicks activation link
2. Sets up permanent password
3. Account activated for portal access
4. Full client portal features available

This system provides complete user lifecycle management from creation to authentication with secure credential handling throughout the process.