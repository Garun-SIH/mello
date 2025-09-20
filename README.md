# Mello - Digital Psychological Intervention System

A comprehensive mental health support platform designed for college students, developed for the Smart India Hackathon. Features a complete multi-role system with Firebase authentication, multi-language support, and advanced mental health tracking capabilities.

## Features

### Core Features
- **AI-Powered Chatbot**: Intelligent conversational AI using Google's Gemini for mental health support
- **Professional Counselor Booking**: Schedule sessions with qualified mental health professionals
- **Resource Library**: Curated mental health resources in multiple languages
- **Peer Support Forum**: Anonymous community support and discussions
- **Mental Health Assessments**: Standardized assessment tools for self-evaluation

### Multi-Role System
- **Student/User Role**: Access to all mental health resources, mood tracking, and counselor booking
- **Counselor Role**: Professional dashboard with patient analytics, appointment management, and reporting tools
- **Admin Role**: Complete system oversight with counselor approval, content moderation, and comprehensive analytics

### Advanced Features
- **Firebase Authentication**: Secure user registration and login
- **Role-Based Access Control**: Different interfaces and permissions for each user type
- **Multi-Language Support**: Full UI translation for Hindi, English, Kashmiri, Dogri, and Urdu
- **Counselor Approval System**: Admin review process for professional counselors
- **Mood Tracking**: Daily mood logging with analytics and insights
- **Professional Reporting**: Counselor session notes and patient progress tracking
- **Content Moderation**: Admin tools for forum post review and resource management
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **MySQL**: Robust relational database for data storage
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Firebase Admin SDK**: Server-side authentication and user management
- **Google Gemini AI**: Advanced AI for chatbot functionality
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **React**: Component-based UI library
- **Firebase SDK**: Client-side authentication
- **TailwindCSS**: Utility-first CSS framework
- **Recharts**: Composable charting library for React
- **Lucide React**: Beautiful & consistent icon toolkit
- **Axios**: Promise-based HTTP client

## Project Structure

```
mello/
├── mello-backend/          # FastAPI backend
│   ├── routers/           # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── admin.py      # Admin-only endpoints
│   │   ├── counselor.py  # Counselor-specific endpoints
│   │   ├── user.py       # User-specific endpoints
│   │   ├── chat.py       # Chatbot functionality
│   │   ├── booking.py    # Appointment booking
│   │   ├── resources.py  # Resource management
│   │   ├── forum.py      # Forum functionality
│   │   └── analytics.py  # Analytics endpoints
│   ├── models.py          # Database models with role system
│   ├── database.py        # Database configuration
│   ├── firebase_config.py # Firebase Admin SDK setup
│   ├── auth.py           # Authentication middleware
│   ├── main.py           # FastAPI application
│   └── requirements.txt   # Python dependencies
├── mello-frontend/        # React frontend
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   │   ├── Login.js         # Login component
│   │   │   ├── Register.js      # Registration component
│   │   │   ├── ProtectedRoute.js # Route protection
│   │   │   ├── RoleBasedDashboard.js # Role-based routing
│   │   │   ├── Sidebar.js       # Navigation sidebar
│   │   │   ├── LanguageSwitcher.js # Multi-language switcher
│   │   │   └── Layout.js        # Main layout wrapper
│   │   ├── contexts/     # React contexts
│   │   │   ├── AuthContext.js   # Authentication context
│   │   │   └── LanguageContext.js # Multi-language context
│   │   ├── pages/        # Page components
│   │   │   ├── UserDashboard.js     # Student dashboard
│   │   │   ├── CounselorDashboard.js # Counselor dashboard
│   │   │   └── AdminDashboard.js    # Admin dashboard
│   │   ├── firebase.js   # Firebase client configuration
│   │   └── App.js        # Main application with routing
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
└── README.md             # Project documentation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Gemini API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd mello-backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create MySQL database:
```sql
CREATE DATABASE mello_db;
```

5. Seed the database:
```bash
python create_tables.py
python seed_data.py
```

6. Start the server:
```bash
uvicorn main:app --reload
```

Backend will be available at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd mello-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will be available at: http://localhost:3000

## 🔧 Configuration

### Environment Variables

#### Backend (.env in mello-backend/)
```env
DATABASE_URL=mysql+pymysql://username:password@localhost/mello_db
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
SECRET_KEY=your_secret_key_here
FIREBASE_ADMIN_CREDENTIALS_PATH=path/to/firebase-credentials.json
```

#### Frontend (.env in mello-frontend/)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## 📊 Features

### 1. AI Chatbot
- Powered by Google Gemini AI
- Categorizes conversations (stress, anxiety, sleep, etc.)
- Escalation detection for serious concerns
- Anonymous chat logging

### 2. Counselor Booking
- Browse available counselors
- Real-time slot availability
- Confidential booking system
- Booking management

### 3. Wellness Resources
- Curated mental health content including meditation guides
- Multi-language support (Hindi, English, Kashmiri, Dogri, Urdu)
- Categorized by topic (meditation, mindfulness, stress relief)
- Multiple content types (video, audio, articles, guided sessions)

### 4. Peer Support Forum
- Anonymous posting system
- Category-based discussions
- Community moderation
- Like/engagement system

### 5. Analytics Dashboard
- Usage statistics
- Category breakdowns
- Trend analysis
- Popular content tracking

## 🛡️ Privacy & Security

- All conversations are confidential
- Anonymous user identification
- No personal data storage without consent
- GDPR-compliant data handling
- Secure API endpoints

## 🎨 UI/UX Design

- Clean, modern interface with TailwindCSS
- Soft color palette (blues, greens, grays)
- Responsive design for all devices
- Accessibility-focused components
- Intuitive navigation

## 📱 Demo Flow

1. **Home** → Overview and quick access
2. **Chatbot** → AI-powered mental health support
3. **Booking** → Schedule counselor sessions
4. **Resources** → Browse wellness content
5. **Forum** → Connect with peers
6. **Analytics** → View platform insights (admin)

## 🚀 Deployment

### Backend Deployment
```bash
# Production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build
```

## 🧪 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🏆 Smart India Hackathon

Built for SIH 2024 - Digital Psychological Intervention System for College Students

**Team**: Mello Development Team  
**Category**: Software  
**Theme**: Mental Health & Wellness

---

Made with ❤️ for student mental wellness
