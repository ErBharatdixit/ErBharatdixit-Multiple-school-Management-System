# 🏫 Multiple School Management System

A modern, production-ready school management system built with the MERN stack (MongoDB, Express, React, Node.js). Supports multiple schools with role-based access control for SuperAdmins, Admins, Teachers, and Students.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected routes with automatic token refresh

### 👥 User Roles
- **SuperAdmin**: Manage multiple schools, create school admins
- **Admin**: Manage teachers, students, classes within their school
- **Teacher**: Record attendance, enter marks
- **Student**: View attendance, marks, and academic records

### 📊 Core Functionality
- School management (CRUD operations)
- User management with role assignments
- Class and subject management
- Attendance tracking
- Marks entry with automatic grade calculation
- Dashboard for each user role

### 🎨 Modern UI/UX
- Tailwind CSS with custom design system
- Responsive design (mobile-first)
- Glassmorphism effects
- Smooth animations
- Custom scrollbars
- Google Fonts (Inter)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MultipleSchoolManageMentSystem
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📁 Project Structure

### Backend
```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   └── middleware/      # Auth & error handling
├── server.js            # Express app entry
└── .env                 # Environment variables
```

### Frontend
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context (Auth)
│   ├── pages/           # Page components
│   ├── api.js           # Axios configuration
│   ├── App.jsx          # Main app component
│   └── index.css        # Tailwind + custom styles
└── tailwind.config.js   # Tailwind configuration
```

## 🔑 Creating Your First User

To create a SuperAdmin account, make a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "superadmin"
  }'
```

Then login at `http://localhost:5173/login` with:
- Email: admin@school.com
- Password: admin123

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Schools (SuperAdmin only)
- `GET /api/schools` - Get all schools
- `POST /api/schools` - Create school
- `GET /api/schools/:id` - Get single school
- `PUT /api/schools/:id` - Update school
- `DELETE /api/schools/:id` - Delete school

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - Request logging
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🎯 Roadmap

- [ ] Admin dashboard (manage teachers/students)
- [ ] Teacher dashboard (attendance & marks)
- [ ] Student dashboard (view records)
- [ ] Data tables with search & pagination
- [ ] Form validation (React Hook Form)
- [ ] File uploads (profile pictures)
- [ ] Email notifications
- [ ] Reports generation (PDF)
- [ ] Dark mode
- [ ] Real-time notifications (Socket.io)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using the MERN stack**
