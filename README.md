# Attendance Management System

A complete, production-ready frontend for an Attendance Management Application built with React, TypeScript, and modern web technologies. This project uses mock APIs (MSW) to simulate backend functionality, making it easy to develop and test before connecting to real backend services.

## 🚀 Features

- **Authentication**: JWT-based login system with protected routes
- **Dashboard**: Overview of key attendance metrics and recent activity
- **User Management**: Complete CRUD operations for employee accounts
- **Attendance Tracking**: Clock in/out records with filters and date presets
- **Company Settings**: Configuration for company details and preferences
- **Mock API Layer**: MSW (Mock Service Worker) for API simulation
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: Built with Shadcn UI and Tailwind CSS
- **State Management**: Redux Toolkit for predictable state management
- **Form Validation**: Formik + Yup for robust form handling
- **Type Safety**: Full TypeScript implementation

## 📋 Tech Stack

- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with design system tokens
- **State Management**: Redux Toolkit
- **Forms**: Formik + Yup validation
- **Mock APIs**: MSW (Mock Service Worker)
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **UI Components**: Shadcn UI
- **Routing**: React Router v6

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn/bun

### Quick Start

```bash
# Install dependencies
npm install

# Start development server with MSW
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run at `http://localhost:8080` with MSW intercepting API calls.

## 🔐 Demo Credentials

```
Email: admin@example.com
Password: password123
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/           # AppLayout, AppSidebar
│   ├── ui/              # Shadcn UI components
│   └── ProtectedRoute.tsx
├── pages/
│   ├── auth/
│   │   └── Login.tsx
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Attendance.tsx
│   └── NotFound.tsx
├── store/
│   ├── slices/          # Redux slices (auth, users, attendance)
│   └── index.ts         # Store configuration
├── mocks/
│   ├── handlers.ts      # MSW request handlers
│   └── browser.ts       # MSW browser setup
├── lib/
│   └── apiClient.ts     # Centralized API client
├── App.tsx
└── main.tsx
```

## 🔌 API Integration

### Current Setup (Mock APIs)

The app uses **MSW (Mock Service Worker)** to intercept network requests and return mock data. This is automatically enabled in development mode.

### Switching to Real Backend

To connect to a real backend API:

1. **Set Environment Variable**:
   Create a `.env` file:
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

2. **Disable MSW**:
   Remove or comment out MSW initialization in `src/main.tsx`:
   ```typescript
   // Comment out or remove:
   // if (import.meta.env.DEV) {
   //   import('./mocks/browser').then(({ worker }) => {
   //     worker.start();
   //   });
   // }
   ```

3. **Update API Client**:
   The `apiClient.ts` already reads from `VITE_API_BASE_URL`. No code changes needed!

### API Endpoints Required

Your backend should implement these endpoints:

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users?search=&page=&limit=&role=&active=` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Attendance
- `GET /api/attendance?from=&to=&branch=&preset=` - List attendance records
- `GET /api/attendance/:id` - Get attendance detail
- `PUT /api/attendance/:id` - Update attendance record
- `POST /api/attendance/export` - Export attendance data

#### Company
- `GET /api/company` - Get company settings
- `PUT /api/company` - Update company settings

#### Billing
- `GET /api/billing/invoices` - List invoices
- `GET /api/billing/subscription` - Get subscription info

See `src/mocks/handlers.ts` for complete request/response shapes and `db.json` for data structure.

## 📦 Alternative: JSON Server

For quick backend prototyping, you can use `json-server`:

```bash
# Install json-server
npm install -g json-server

# Run json-server with db.json
json-server --watch db.json --port 3001

# Update .env
VITE_API_BASE_URL=http://localhost:3001
```

## 🎨 Design System

The app uses a comprehensive design system with semantic tokens defined in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme extensions

### Key Design Tokens

```css
--primary: Teal/cyan (#0ea5a4)
--success: Green for positive states
--warning: Amber for caution
--destructive: Red for errors
```

All components use these tokens for consistent theming and easy customization.

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests (Coming Soon)
Playwright tests for critical user flows:
- Login → Dashboard
- User Management (CRUD)
- Attendance Tracking

## 🚢 Deployment

```bash
# Build production bundle
npm run build

# Deploy the `dist` folder to your hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

### Environment Variables for Production

```bash
VITE_API_BASE_URL=https://api.production.com
```

## 📝 Pages Implemented

- ✅ Login (`/auth/login`)
- ✅ Dashboard (`/`)
- ✅ Users List & Management (`/users`)
- ✅ Attendance Records (`/attendance`)
- 🚧 Company Settings (`/companies`)
- 🚧 General Settings (`/settings/general`)
- 🚧 Notifications (`/notifications`)
- 🚧 Reports (`/reports`)

Pages marked with 🚧 show placeholder content and are ready for implementation.

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

1. Ensure all TypeScript types are properly defined
2. Follow the existing code structure and naming conventions
3. Use the design system tokens instead of hardcoded values
4. Add proper error handling and loading states
5. Keep components small and focused

## 📄 License

MIT License - feel free to use this project for commercial or personal purposes.

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Review the mock handlers in `src/mocks/handlers.ts`
3. Verify API client configuration in `src/lib/apiClient.ts`

## 🎯 Roadmap

- [ ] Complete settings pages
- [ ] Add user creation/edit forms
- [ ] Implement CSV/PDF export functionality
- [ ] Add geofencing UI
- [ ] Timesheet approval workflows
- [ ] Notification center functionality
- [ ] Advanced filtering and search
- [ ] Real-time updates with WebSocket
- [ ] Mobile app version (React Native)

---

**Note**: This is a frontend-only implementation. The backend API contracts are defined in `src/mocks/handlers.ts` and sample data in `db.json`. Use these as references when building or connecting to a real backend.
