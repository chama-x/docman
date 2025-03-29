# DocMan - Document Management System

A document management system for school administrators and teachers to upload, manage, and organize important documents.

## Features

- User authentication with role-based access control
- Document upload and management
- Approval workflow for documents
- Document categorization
- Administrative dashboard
- Teacher dashboard
- Mobile responsive design

## Tech Stack

- React 19
- TypeScript
- Firebase (Authentication, Realtime Database)
- Cloudinary (Document storage)
- TailwindCSS
- Vite

## Getting Started

### Prerequisites

- Node.js (version 18+)
- npm or yarn

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/docman.git
   cd docman
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables (see `.env.example` for required variables)

4. Start the development server

   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Deployment

### Netlify Deployment

This project is configured for easy deployment to Netlify.

1. Push your code to a GitHub repository

2. Connect your GitHub repository to Netlify:
   - Sign in to Netlify
   - Click "New site from Git"
   - Select GitHub and authorize Netlify
   - Pick your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. Configure environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add all the required environment variables from your `.env` file

4. Deploy your site!

### Manual Deployment

To build the project for production:

```
npm run build
```

The build files will be generated in the `dist` directory.

## Test Accounts

- Principal: <principal@school.edu> / password123
- Document Manager: <docmanager@school.edu> / password123
- Teachers: <teacher1@school.edu>, <teacher2@school.edu>, <teacher3@school.edu> / password123

## License

This project is licensed under the MIT License.
