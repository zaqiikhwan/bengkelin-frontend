# Bengkelin Frontend - Architecture Summary

## Overview

Bengkelin is an automotive workshop (bengkel) booking platform frontend built with React 19, TypeScript, and Vite. It supports two user roles: **Customers** (browse/book workshops) and **Mitra/Bengkel Owners** (manage their workshop and orders).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite (rolldown-vite) |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS 3.4 |
| HTTP Client | Axios |
| Icons | Heroicons, Lucide React |
| UI Components | Headless UI |

---

## Directory Structure

```
src/
├── components/       # Shared UI components
│   ├── Layout.tsx            # Main authenticated layout (nav + outlet)
│   ├── ProtectedRoute.tsx    # Auth guard for protected routes
│   ├── PublicHeader.tsx      # Header for unauthenticated pages
│   ├── DarkModeToggle.tsx    # Theme toggle
│   └── WebSocketDebugPanel.tsx
│
├── pages/            # Route-level page components
│   ├── LandingPage.tsx       # Public homepage
│   ├── Login.tsx             # Login (dual role: user/mitra)
│   ├── RegisterPage.tsx      # Registration
│   ├── DashboardPage.tsx     # Dashboard (role-aware)
│   ├── BengkelsPage.tsx      # Bengkel list (protected, uses Layout)
│   ├── BengkelListPage.tsx   # Bengkel list (public + auth-aware)
│   ├── BengkelDetailPage.tsx # Public bengkel detail
│   ├── BengkelManagementPage.tsx  # Mitra: manage own bengkel
│   ├── BookingPage.tsx       # Customer: book a service
│   ├── OrdersPage.tsx        # Order list (role-aware)
│   ├── OrderDetailsPage.tsx  # Single order detail
│   ├── ChatPage.tsx          # Real-time chat (WebSocket)
│   ├── ProfilePage.tsx       # User/mitra profile
│   ├── VehiclesPage.tsx      # Customer: manage vehicles
│   ├── AddressesPage.tsx     # Customer: manage addresses
│   └── HealthPage.tsx        # API health check
│
├── services/         # API & real-time communication
│   ├── api.ts                # Axios-based REST API client
│   └── websocket.ts          # WebSocket service for chat
│
├── hooks/            # Custom React hooks
│   └── useAuth.tsx           # Auth context (AuthProvider + useAuth)
│
├── contexts/         # React contexts
│   └── ThemeContext.tsx       # Dark mode theme context
│
├── types/            # TypeScript type definitions
│   ├── api.ts                # API request/response types
│   └── index.ts              # General domain types
│
└── main.tsx          # App entry point
```

---

## Routing Architecture

### Route Categories

**Public Routes** (no auth required):
| Path | Component | Notes |
|------|-----------|-------|
| `/` | `LandingPage` | Public homepage |
| `/login` | `Login` | Redirects to `/dashboard` if authenticated |
| `/register` | `RegisterPage` | Redirects to `/dashboard` if authenticated |
| `/bengkels` | `BengkelListPage` | Public bengkel listing (auth-aware header) |
| `/bengkels/:id` | `BengkelDetailPage` | Public bengkel detail |

**Protected Routes** (requires auth, wrapped in `<Layout />`):
| Path | Component |
|------|-----------|
| `/dashboard` | `DashboardPage` |
| `/profile` | `ProfilePage` |
| `/orders` | `OrdersPage` |
| `/orders/:orderId` | `OrderDetailsPage` |
| `/vehicles` | `VehiclesPage` |
| `/addresses` | `AddressesPage` |
| `/chat` | `ChatPage` |
| `/bengkel` | `BengkelManagementPage` |
| `/booking/:bengkelId` | `BookingPage` |
| `/health` | `HealthPage` |

### Layout Pattern

```
<AuthProvider>
  <Router>
    <Routes>
      <!-- Public: direct component -->
      <Route path="/bengkels" element={<BengkelListPage />} />

      <!-- Protected: Layout wraps child via <Outlet /> -->
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  </Router>
</AuthProvider>
```

`Layout` renders the shared navigation bar + `<Outlet />` for the child page content.

---

## Authentication System

### Dual-Role Auth

The app supports two distinct user types stored in `localStorage`:
- **`users`** - Customers who book services
- **`mitras`** - Bengkel owners who manage workshops

### Auth Flow

```
useAuth hook (AuthContext)
  ├── loginAsUser(email, password)    → stores user tokens + profile
  ├── loginAsMitra(email, password)   → stores mitra tokens + profile
  ├── registerAsUser(userData)        → auto-login after register
  ├── registerAsMitra(userData)       → auto-login after register
  ├── logout()                        → clears localStorage + state
  ├── refreshUser()                   → re-fetch profile
  └── switchUserType(type)            → toggle between user/mitra
```

### Token Management (api.ts)

- **Access token**: stored in `localStorage.access_token`
- **Refresh token**: stored in `localStorage.refresh_token`
- **User type**: stored in `localStorage.user_type`
- Axios interceptors auto-attach `Bearer` token to all requests
- Automatic token refresh on 401 responses with request queuing

---

## API Service Layer

`services/api.ts` exposes a singleton `apiService` with two Axios instances:
- `this.api` → base URL `/api/v1`
- `this.apiV2` → base URL `/api/v2`

### API Modules

| Domain | Endpoints |
|--------|-----------|
| Auth | `login`, `register`, `refreshToken`, `getUserProfile`, `getMitraProfile` |
| Bengkels | `getBengkels`, `getBengkelDetail`, `searchBengkels`, `createBengkel`, `updateBengkel*` |
| Orders | `getUserOrders`, `getMitraOrders`, `createOrder`, `updateOrderStatus` |
| Chat | `getChatRooms`, `getRoomMessages`, `sendMessage`, `markMessagesAsRead` |
| Vehicles | `getUserVehicles`, `addVehicle`, `updateVehicle`, `deleteVehicle` |
| Addresses | `getUserAddresses`, `addAddress`, `updateAddress`, `deleteAddress` |
| Health | `getHealthStatus` |

---

## Real-Time Chat System

### WebSocket Architecture

```
ChatPage
  ├── webSocketService.connect()         # Connect with JWT auth
  ├── webSocketService.joinRoom(roomId)  # Join a chat room
  ├── webSocketService.sendMessage()     # Send via WebSocket
  └── Event Listeners:
      ├── "new_message"      → update messages + room list
      ├── "typing_update"    → show typing indicator
      ├── "message_read"     → update read receipts
      ├── "presence_update"  → online/offline status
      ├── "connected"        → enable real-time mode
      └── "disconnected"     → fallback to HTTP polling
```

### Hybrid Approach

- **Primary**: WebSocket for sending + receiving messages
- **Fallback**: HTTP API polling every 5 seconds when WebSocket is disconnected
- **Optimistic UI**: Temp messages shown immediately, replaced on server confirmation

---

## State Management

No external state library (Redux, Zustand, etc.). State is managed via:

| Pattern | Usage |
|---------|-------|
| `React Context` | Auth (`useAuth`), Theme (`ThemeContext`) |
| `useState` | Component-local state |
| `useReducer` | Chat messages (`ChatPage`) |
| `useRef` | Mutable refs (selected room, message container scroll) |
| `localStorage` | Tokens, user type persistence |

---

## Styling

- **Tailwind CSS** with custom config (`tailwind.config.js`)
- **Dark mode** via `ThemeContext` + `dark:` Tailwind variants
- Custom utility classes: `btn-primary`, `btn-secondary`, `card`, `input-field`
- Color tokens: `primary-*`, `success-*`, `danger-*`

---

## User Roles & Page Access

| Page | Customer | Mitra/Owner |
|------|----------|-------------|
| Dashboard | Recent orders + available bengkels | Own bengkel + orders |
| Bengkels | Browse & book | N/A (has `/bengkel` management) |
| Orders | My orders | Bengkel orders |
| Chat | Chat with bengkel | Chat with customers |
| Profile | Edit profile | Edit profile + bank info |
| Vehicles | Manage vehicles | N/A |
| Addresses | Manage addresses | N/A |
| Booking | Book service at bengkel | N/A |

---

## Key Design Decisions

1. **Public bengkel listing**: `/bengkels` is accessible without auth, allowing SEO and public browsing
2. **Dual auth system**: Separate login/register flows for users vs mitras
3. **No global state library**: Context + local state is sufficient for this app's complexity
4. **WebSocket-first chat**: Real-time messaging with HTTP polling fallback
5. **Optimistic UI**: Chat messages appear immediately before server confirmation
6. **Token refresh with queue**: Prevents multiple simultaneous refresh requests
