# Haxcode - Hackathon Hosting Platform

A modern, full-stack hackathon hosting platform built with React, Vite, and TailwindCSS. Haxcode provides a comprehensive solution for organizing, participating in, and judging hackathons with real-time collaboration features.

## 🚀 Features

- **Multi-role Support**: Participants, Organizers, and Judges
- **Real-time Collaboration**: Socket.io integration for live updates
- **Modern UI/UX**: Beautiful, responsive design with TailwindCSS
- **Role-based Access Control**: Secure routing and permissions
- **Authentication System**: JWT-based auth with social login options
- **Responsive Design**: Mobile-first approach with modern components

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS with custom design system
- **Routing**: React Router DOM v7
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io Client
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Basic UI components (buttons, inputs, etc.)
│   ├── auth/          # Authentication related components
│   ├── dashboard/     # Dashboard specific components
│   └── common/        # Common layout and navigation
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── participant/   # Participant specific pages
│   ├── organizer/     # Organizer specific pages
│   └── judge/         # Judge specific pages
├── services/          # API service functions
├── context/           # React Context providers
├── utils/             # Utility functions and helpers
└── assets/            # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Purple tones for secondary actions
- **Accent**: Yellow tones for highlights and warnings
- **Neutral**: Gray scale for text and backgrounds
- **Semantic**: Success (green), Warning (orange), Error (red)

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Cards**: Standard and hover variants with shadows
- **Inputs**: Form inputs with validation states
- **Layout**: Responsive sidebar navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haxcode-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update the values in `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   VITE_APP_NAME=Haxcode
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication & Roles

### User Roles
- **Participant**: Can register for hackathons, submit projects, join teams
- **Organizer**: Can create and manage hackathons, view analytics
- **Judge**: Can review submissions, provide feedback, score projects

### Protected Routes
- `/dashboard` - General dashboard (authenticated users)
- `/participant/*` - Participant specific features
- `/organizer/*` - Organizer specific features  
- `/judge/*` - Judge specific features

## 🌐 API Integration

The platform integrates with a backend API for:
- User authentication and management
- Hackathon CRUD operations
- Project submissions and reviews
- Real-time notifications and updates

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/hackathons` - List hackathons
- `POST /api/hackathons` - Create hackathon
- `GET /api/hackathons/:id` - Get hackathon details

## 🔌 Real-time Features

Socket.io integration provides:
- Live hackathon updates
- Real-time notifications
- Live chat during hackathons
- Submission status updates

## 📱 Responsive Design

- **Mobile-first approach**
- **Responsive navigation** with collapsible sidebar
- **Touch-friendly interfaces**
- **Optimized for all screen sizes**

## 🎯 Key Components

### Layout Component
- Responsive sidebar navigation
- Role-based menu items
- User profile and logout
- Mobile-friendly design

### Authentication Components
- Login/Register forms with validation
- Social login options
- Password strength indicators
- Form error handling

### Dashboard Components
- Role-specific dashboards
- Statistics and metrics
- Quick action buttons
- Recent activity feeds

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Protected routes
- Form validation
- XSS protection
- CSRF protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
VITE_APP_NAME=Haxcode
VITE_APP_VERSION=1.0.0
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Team management system
- [ ] Advanced analytics dashboard
- [ ] Payment integration
- [ ] Video conferencing
- [ ] AI-powered project matching
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced search and filters

---

Built with ❤️ by the Haxcode Team
