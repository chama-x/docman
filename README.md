# School Document Manager

A document management system for schools where staff can manage their files based on roles.

## Features

- Pre-loaded document types (NIC, Birth Certificate, etc.)
- Role-based access control (Admin, Teacher)
- Document category management for admins
- Document uploading and tracking for all users
- Testing mode with sample users and documents

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/school-document-manager.git
cd school-document-manager
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up Firebase
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Set up Firebase Storage

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

## Testing the Application

The application comes with a test mode that can be used to quickly set up sample users and documents.

### Test Users

After setting up the application:

1. Register a new account with admin privileges by checking the "Administrator (Principal)" checkbox.
2. Login with the newly created admin account.
3. From the admin dashboard, click the "Generate Test Users" button. This will create the following test accounts:

   | Email | Password | Role |
   |-------|----------|------|
   | <principal@school.edu> | password123 | Admin |
   | <docmanager@school.edu> | password123 | Admin |
   | <teacher1@school.edu> | password123 | Teacher |
   | <teacher2@school.edu> | password123 | Teacher |
   | <teacher3@school.edu> | password123 | Teacher |

4. Click "Generate Sample Documents" to create random documents for all users.

### Testing Different User Roles

#### Admin User

- Can manage document categories (add, edit, delete)
- Can upload documents
- Can view test user management

#### Teacher User

- Can upload documents
- Can see teacher-specific document types
- Cannot manage document categories

## Document Type Management

Admins can:

- Add new document types (common or teacher-specific)
- Edit existing document types
- Delete document types

## Document Upload

All users can:

- Upload PDF documents (up to 5MB)
- Select document type from available options
- View their uploaded documents
- Delete their documents

## Project Structure

- `/src`: Source files
  - `/components`: React components
  - `/contexts`: Context providers
  - `/services`: Firebase services
  - `/types`: TypeScript interfaces

## License

This project is licensed under the MIT License.
