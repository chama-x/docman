# Firebase Setup Instructions

## 1. Upload Security Rules to Firebase

The errors you're experiencing are related to Firebase Realtime Database permissions. To fix them, follow these steps:

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project "docman-b4507"
3. Click on "Realtime Database" in the Build menu
4. Go to the "Rules" tab
5. Replace the current rules with the content of the `firebase-rules.json` file created in this project
6. Click "Publish" to save the rules

## 2. Initialize Admin Users

If you're using the admin account "principal@school.edu", ensure it exists in your Firebase Authentication:

1. In the Firebase Console, go to "Authentication" in the Build menu
2. Click "Add User" 
3. Enter the email "principal@school.edu" and a password
4. After creating, log in to the application using these credentials

## 3. File Structure Changes

The 404 errors for JavaScript files have been fixed by:

1. Creating the missing files in `/public/assets/js/`
2. Adding an `.htaccess` file to handle routing

## 4. Code Updates

Several files have been modified to handle permission errors gracefully:

- `src/services/initService.ts`: Now checks for authentication before operations
- `src/App.tsx`: Better handles initialization and authentication flow
- `src/firebase.ts`: No changes needed, configuration was correct

## 5. Testing

After making these changes:

1. Clear your browser cache
2. Log out and log back in with an admin account
3. Check the console for any remaining errors

If you still encounter issues, ensure that your Firebase project has the Realtime Database properly set up and that your security rules allow the operations you're trying to perform. 