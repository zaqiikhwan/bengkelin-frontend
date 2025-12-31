# Bengkelin Frontend

A comprehensive React + TypeScript frontend application for the Bengkelin automotive repair marketplace platform. Built with modern web technologies and designed to connect vehicle owners with automotive repair shops.

## 🚀 Features

### 🔐 **Dual Authentication System**
- **Customer Registration/Login** - For vehicle owners seeking repair services
- **Mitra Registration/Login** - For bengkel (repair shop) owners
- JWT-based authentication with automatic token refresh
- Google OAuth integration support
- Role-based navigation and features
- **Automatic redirect** to dashboard after successful login/registration

### 💬 **Real-time Chat System**
- **WebSocket Integration** - Real-time messaging with automatic reconnection
- **Room-based Messaging** - Organized conversations between users and bengkels  
- **File Sharing** - Send images and documents in chat
- **Message Status** - Read receipts and delivery confirmations
- **Typing Indicators** - See when others are typing
- **Message Management** - Edit and delete messages
- **Cross-platform** - Works for both customers and bengkel owners
- **Offline Support** - Messages sync when connection is restored

### � **dCustomer Features**
- **Dashboard** - Overview of orders, nearby bengkels, and statistics
- **Bengkel Discovery** - Browse, search, and filter available repair shops
- **Order Management** - Track service orders through multiple stages (Created → Confirmed → Finished → Paid)
- **Vehicle Management** - Register and manage multiple vehicles
- **Address Management** - Save addresses for home service bookings
- **Real-time Chat** - Communication with bengkel owners
- **Review System** - Leave testimonials and ratings

### 🏪 **Mitra (Bengkel Owner) Features**
- **Bengkel Management** - Complete profile setup and management
- **Service Configuration** - Define available services and pricing
- **Operational Hours** - Set daily operating schedules
- **Order Processing** - Manage incoming orders and update status
- **Photo Gallery** - Showcase bengkel facilities
- **Customer Communication** - Chat with customers
- **Analytics Dashboard** - Track performance and revenue

### 🎨 **Modern UI/UX**
- **Mobile-first responsive design** with Tailwind CSS
- **Custom color palette** with primary, success, and danger themes
- **Accessible components** with proper ARIA labels
- **Loading states** and error handling throughout
- **Smooth transitions** and hover effects
- **Clean, intuitive interface** following modern design principles

## 🛠 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and better developer experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS v3** - Utility-first CSS framework with custom configuration
- **React Router v7** - Client-side routing with nested routes
- **Axios** - HTTP client with request/response interceptors
- **Heroicons** - Beautiful SVG icons
- **Headless UI** - Accessible UI components (ready for integration)

## 📡 API Integration

The frontend is designed to work seamlessly with the Bengkelin API backend:

### Authentication Endpoints
- `POST /users/auth/login` - Customer login
- `POST /users/auth/register` - Customer registration
- `POST /mitras/auth/login` - Mitra login
- `POST /mitras/auth/register` - Mitra registration
- `POST /{userType}/auth/refresh` - Token refresh
- `POST /{userType}/auth/logout` - Single device logout
- `GET /users/profile` - Get user profile

### Core Business Endpoints
- `GET /bengkels` - List bengkels with pagination
- `GET /bengkels/search` - Search bengkels by service/query
- `GET /bengkels/nearest` - Find nearest bengkels by location
- `GET /bengkels/testimoni/{id}` - Get bengkel details with testimonials
- `POST /bengkels/order/service/{userId}` - Create service order
- `GET /bengkels/orders/list/user` - Get user orders
- `GET /bengkels/orders/list/mitra` - Get mitra orders
- `PATCH /bengkels/order/status/{orderId}` - Update order status

### Management Endpoints
- `POST /bengkels/new` - Create new bengkel
- `PATCH /bengkels/profile` - Update bengkel profile
- `POST /bengkels/service` - Add bengkel services
- `POST /bengkels/photo` - Upload bengkel photos
- `POST /users/auth/vehicle` - Add user vehicle
- `POST /users/auth/address` - Add user address

### Chat & Communication
- `GET /api/v2/chat/ws` - WebSocket connection endpoint
- `POST /api/v2/chat/rooms` - Create or get chat room
- `GET /api/v2/chat/rooms` - Get user's chat rooms
- `GET /api/v2/chat/rooms/{roomId}` - Get specific chat room
- `GET /api/v2/chat/rooms/{roomId}/messages` - Get room messages
- `GET /api/v2/chat/bengkel/rooms` - Get bengkel's chat rooms
- `POST /api/v2/chat/messages` - Send text message
- `POST /api/v2/chat/messages/file` - Send file message
- `PATCH /api/v2/chat/messages/{messageId}` - Edit message
- `DELETE /api/v2/chat/messages/{messageId}` - Delete message
- `POST /api/v2/chat/messages/read` - Mark messages as read
- `POST /api/v2/chat/realtime/typing` - Send typing indicator

### Legacy Chat Endpoints (v1)
- `GET /chats/appToken` - Get app token for chat
- `GET /chats/chatToken` - Get chat token
- `POST /chats/user/history` - Create chat history
- `GET /chats/user/history` - Get chat history

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** 
- **npm or yarn**
- **Bengkelin backend service** running at `http://localhost:3000`

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd bengkelin-frontend
npm install
```

2. **Configure environment variables:**
```bash
# .env file
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_BASE_URL=ws://localhost:3000/api/v2/chat/ws
VITE_APP_NAME=Bengkelin
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Visit [http://localhost:5173](http://localhost:5173)

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Layout.tsx          # Main layout with navigation
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── hooks/                  # Custom React hooks
│   └── useAuth.tsx         # Authentication state management
├── pages/                  # Page components
│   ├── Login.tsx           # Login page with user type selection
│   ├── RegisterPage.tsx    # Registration with dual user types
│   ├── DashboardPage.tsx   # Main dashboard
│   ├── BengkelsPage.tsx    # Bengkel discovery and search
│   ├── OrdersPage.tsx      # Order management and tracking
│   ├── VehiclesPage.tsx    # Vehicle management (customers)
│   ├── AddressesPage.tsx   # Address management (customers)
│   ├── BengkelManagementPage.tsx # Bengkel management (mitras)
│   ├── ChatPage.tsx        # Real-time messaging
│   ├── ProfilePage.tsx     # User profile management
│   └── HealthPage.tsx      # System health monitoring
├── services/               # API integration layer
│   └── api.ts              # Comprehensive API client
├── types/                  # TypeScript type definitions
│   └── api.ts              # Complete API response types
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## 🔐 Authentication Flow

### Customer Flow
1. **Registration** - Provide personal details and create account
2. **Vehicle Setup** - Add vehicles for service bookings
3. **Address Setup** - Add addresses for home service
4. **Service Discovery** - Browse and search bengkels
5. **Order Creation** - Book services and track progress

### Mitra Flow
1. **Registration** - Create mitra account with business details
2. **Bank Setup** - Add banking information for payments
3. **Bengkel Creation** - Set up bengkel profile and services
4. **Operational Setup** - Configure hours and service options
5. **Order Management** - Process customer orders and communicate

## 🎨 Design System

### Color Palette
```css
Primary: #3b82f6 (Blue 500) - Main brand color
Success: #10b981 (Emerald 500) - Success states
Danger: #ef4444 (Red 500) - Error states
```

### Component Classes
```css
.btn-primary - Primary action buttons
.btn-secondary - Secondary action buttons  
.input-field - Form input styling
.card - Content container cards
```

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🔧 Development Guidelines

### Adding New Features
1. **Create types** in `src/types/api.ts`
2. **Add API methods** in `src/services/api.ts`
3. **Build components** with proper TypeScript typing
4. **Add routes** in `src/App.tsx`
5. **Update navigation** in `src/components/Layout.tsx`

### Code Quality
- **TypeScript strict mode** enabled
- **ESLint** for code consistency
- **Proper error handling** throughout
- **Loading states** for all async operations
- **Responsive design** for all components

## 🚀 Production Deployment

### Build Process
```bash
npm run build
```

### Build Output
- **Optimized bundle** with code splitting
- **CSS extraction** and minification
- **Asset optimization** and compression
- **Source maps** for debugging

### Environment Configuration
- **Development**: Local API at `localhost:3000`
- **Staging**: Staging API endpoint
- **Production**: Production API endpoint

## 🔮 Future Enhancements

### Phase 1 Completed ✅
- Dual authentication system
- Basic CRUD operations
- Responsive UI framework
- API integration layer

### Phase 2 (Next Steps)
- **Real-time chat** with WebSocket integration ✅
- **Push notifications** for order updates
- **Payment integration** with multiple providers
- **Advanced search** with filters and sorting
- **Map integration** for location services

### Phase 3 (Advanced Features)
- **Mobile app** with React Native
- **Offline support** with service workers
- **Advanced analytics** and reporting
- **Multi-language support** (i18n)
- **Dark mode** theme support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the automotive repair industry**
