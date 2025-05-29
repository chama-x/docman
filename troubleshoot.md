# Troubleshooting Guide

## Issue: App Stuck at "Loading application..."

### What was causing the problem:

1. **Development vs Production Environment Conflicts**: When Vite dev server was running, WebSocket connections were failing and causing loading state to persist.

2. **Auth State Management**: The AuthContext wasn't properly setting `loading: false` in all scenarios.

3. **Database Initialization Hanging**: The database initialization process could hang indefinitely without timeout.

### Fixes Applied:

1. **Updated `src/App.tsx`**:
   - Added timeout handling (10 seconds) for database initialization
   - Better error handling and logging
   - Added development debug information
   - Fixed loading state dependencies

2. **Updated `src/contexts/AuthContext.tsx`**:
   - Fixed loading state management to always set `loading: false`
   - Better error handling for role updates
   - Proper cleanup of Firebase listeners

3. **Updated `vite.config.ts`**:
   - Added server configuration for better HMR handling
   - Disabled overlay that might interfere with loading
   - Added build optimizations

### How to Test:

#### Development Mode:
```bash
npm run dev
```
- Should load properly without hanging
- Check browser console for debug information
- WebSocket errors should not prevent app from loading

#### Production Mode:
```bash
npm run build
npm run preview
```
- Should work without WebSocket issues
- No debug information shown

#### Netlify Deployment:
- Should work with proper CSP headers
- No CORS or CSP errors

### If Still Having Issues:

1. **Clear browser cache completely**
2. **Try incognito/private window**
3. **Check browser console for specific errors**
4. **Use the debug version**: Navigate to `/debug.html` on your deployed site
5. **Disable browser extensions** (especially AdGuard) temporarily

### Development vs Production Differences:

- **Development**: Uses Vite dev server with HMR, WebSocket connections
- **Production**: Uses static files served by Netlify with proper CSP headers
- **The app should work in both environments now**

### Console Debugging:

Look for these messages in the console:
- "Auth state changed: [email]"
- "Setting user roles: [roles object]"
- "Starting initialization process..."
- "Initialization complete, setting dbInitializing to false"

If you don't see "Initialization complete..." within 10 seconds, there's still an issue with Firebase permissions or network connectivity. 