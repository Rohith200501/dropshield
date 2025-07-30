# EmoTracker - Student Emotion Monitoring System

A comprehensive React + Tailwind application with Firebase Auth for monitoring student emotions using AI-powered face detection, featuring role-based dashboards for Students, Faculty, and Administrators.

## ✨ Features

### 🔐 Authentication System
- **Firebase Authentication** with custom claims/localStorage for role management
- **Multi-Role Support**: Student, Faculty, and Admin login
- **Glitter-Style Login Page** with beautiful animations and particles

### 👨‍🎓 Student Dashboard
- **Mood Emoji Tracker** with 8 different emotions
- **Attendance Button** with automatic late detection
- **Mood History Log** with timestamps and notes
- **Beautiful animations** using Framer Motion

### 👨‍🏫 Faculty Dashboard
- **Student Overview** with real-time mood and attendance data
- **Comment System** for tracking student observations
- **Alert System** to send concerns to admin
- **Search and Filter** functionality

### 👨‍💼 Admin Panel
- **Live Face Emotion Detection** using face-api.js
- **Real-time Camera Feed** with emotion overlay
- **Faculty Alert Management** with severity levels
- **Emotion Analytics** and history tracking
- **MongoDB Integration** for data persistence

### 🎨 UI/UX Features
- **Particles.js** animated backgrounds
- **Framer Motion** transitions and animations
- **Tailwind CSS** responsive design
- **Glass Morphism** effects
- **Custom Glitter Animations**

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Firebase** for authentication
- **face-api.js** for emotion detection
- **particles.js** for background animations
- **Heroicons** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **CORS** for cross-origin requests
- **dotenv** for environment management

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📁 Project Structure

```
/
├── student-emotion-tracker/     # React Frontend
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── GlitterLogin.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── FacultyDashboard.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── contexts/          # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── firebase/          # Firebase Config
│   │   │   └── config.ts
│   │   └── ...
│   ├── public/
│   ├── tailwind.config.js
│   ├── vercel.json           # Vercel deployment config
│   └── ...
├── backend/                   # Express Backend
│   ├── server.js             # Main server file
│   ├── package.json
│   ├── render.yaml          # Render deployment config
│   └── .env.example
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Firebase project
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-emotion-tracker
```

### 2. Frontend Setup
```bash
cd student-emotion-tracker
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 3. Backend Setup
```bash
cd ../backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

### 4. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Get your Firebase config and add to `.env`

### 5. MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in backend `.env`

## 🏃‍♂️ Running the Application

### Development Mode

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
cd student-emotion-tracker
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables
5. Deploy automatically

### Environment Variables

**Frontend (.env)**
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emotracker
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key
```

## 📱 Usage

### For Students
1. Register/Login with student role
2. Track daily mood with emoji selection
3. Mark attendance
4. View mood history and trends

### For Faculty
1. Register/Login with faculty role
2. Monitor student moods and attendance
3. Add comments about students
4. Send alerts to admin for concerning behavior

### For Administrators
1. Register/Login with admin role
2. Monitor live emotion detection via camera
3. Review faculty alerts
4. Analyze emotion data and trends

## 🎯 Features in Detail

### Face Emotion Detection
- Uses face-api.js for real-time emotion detection
- Supports 7 emotions: happy, sad, angry, fearful, disgusted, surprised, neutral
- Confidence scoring for accuracy
- Real-time camera feed with emotion overlay

### Data Persistence
- MongoDB stores all emotion detections
- Student profiles and history
- Faculty comments and alerts
- Analytics and reporting data

### Security
- Firebase Authentication
- Role-based access control
- JWT tokens for API authentication
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **face-api.js** for emotion detection capabilities
- **Firebase** for authentication services
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations
- **particles.js** for background effects

## 📞 Support

For support, email support@emotracker.com or create an issue in this repository.

---

**Built with ❤️ by the EmoTracker Team**
