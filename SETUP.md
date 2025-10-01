# Setup Guide for Backend Integration

This guide explains how to connect the Attendance Management System frontend to a real backend API.

## Current Architecture

The app is built with a clean separation between UI and data layers:

```
Frontend (React)
    ↓
API Client Layer (src/lib/apiClient.ts)
    ↓
Backend API / Mock Server
```

## Step 1: Understanding the Mock Setup

Currently, the app uses **MSW (Mock Service Worker)** to simulate API responses:

- Mock handlers: `src/mocks/handlers.ts`
- Mock initialization: `src/main.tsx`
- Sample data: `db.json`

## Step 2: Prepare Your Backend

Your backend needs to implement these endpoints. See `openapi.json` for full API spec.

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
```

### Users
```
GET    /api/users?search=&page=&limit=
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Attendance
```
GET    /api/attendance?from=&to=&branch=
GET    /api/attendance/:id
PUT    /api/attendance/:id
POST   /api/attendance/export
```

### Company
```
GET /api/company
PUT /api/company
```

### Billing
```
GET /api/billing/invoices
GET /api/billing/subscription
POST /api/billing/change-card
```

## Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
# For local backend
VITE_API_BASE_URL=http://localhost:3001

# For production backend
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Step 4: Disable MSW

In `src/main.tsx`, comment out or remove the MSW initialization:

```typescript
// Comment out these lines:
// if (import.meta.env.DEV) {
//   import('./mocks/browser').then(({ worker }) => {
//     worker.start();
//   });
// }
```

## Step 5: Test the Integration

1. Start your backend server
2. Update `.env` with the correct API URL
3. Run the frontend: `npm run dev`
4. Test the login flow first
5. Verify network requests in browser DevTools

## Step 6: Handle CORS (if needed)

If your backend is on a different domain, configure CORS headers:

```javascript
// Example Express.js CORS setup
app.use(cors({
  origin: 'http://localhost:8080', // Your frontend URL
  credentials: true
}));
```

## Data Structure Reference

### User Object
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  kioskNumber: string;
  active: boolean;
  avatarUrl?: string;
  branch: string;
  managerId?: string;
}
```

### Attendance Object
```typescript
{
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut: string; // HH:MM
  durationHours: number;
  locationIn: {
    lat: number;
    lng: number;
    label: string;
  };
  locationOut?: {
    lat: number;
    lng: number;
    label: string;
  };
  notes?: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
}
```

## Authentication Flow

1. User submits login form
2. Frontend calls `POST /api/auth/login`
3. Backend returns JWT token and user object
4. Frontend stores token in localStorage
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Protected routes check for token in Redux store

## File Upload (Future)

For avatar uploads and file attachments, your backend should support:

```
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "url": "https://cdn.yourdomain.com/uploads/avatar.jpg"
}
```

## Common Issues & Solutions

### Issue: 401 Unauthorized
- **Solution**: Check if token is being sent in Authorization header
- Verify token is valid and not expired

### Issue: CORS errors
- **Solution**: Add CORS headers to backend responses
- Allow credentials if using cookies

### Issue: 404 Not Found
- **Solution**: Verify API routes match exactly
- Check VITE_API_BASE_URL doesn't have trailing slash

### Issue: Response format mismatch
- **Solution**: Compare backend response with mock responses in `src/mocks/handlers.ts`
- Ensure response structure matches Redux slice expectations

## Testing Checklist

- [ ] Login works with real credentials
- [ ] Token is stored and persisted on reload
- [ ] Protected routes redirect to login when not authenticated
- [ ] Users list loads from backend
- [ ] User CRUD operations work
- [ ] Attendance records load with filters
- [ ] Date presets work correctly
- [ ] Error messages display properly
- [ ] Loading states show during API calls
- [ ] Logout clears token and redirects

## Production Deployment

1. Build the frontend: `npm run build`
2. Deploy `dist/` folder to hosting (Vercel, Netlify, AWS S3, etc.)
3. Set production environment variables
4. Ensure backend API is accessible from frontend domain
5. Configure proper CORS for production domain

## Support

For questions about the API integration:
1. Check `src/mocks/handlers.ts` for expected request/response formats
2. Review `src/lib/apiClient.ts` for API call implementation
3. See `openapi.json` for complete API specification

## Next Steps

After basic integration works:
1. Implement real-time updates (WebSocket/SSE)
2. Add file upload for avatars
3. Implement advanced filtering
4. Add bulk operations
5. Set up analytics tracking
