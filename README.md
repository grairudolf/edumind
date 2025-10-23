# EduMind - AI-Powered Educational Chatbot

EduMind is an intelligent educational chatbot designed to provide personalized tutoring for students. Built with modern AI technologies, it adapts to each student's learning style and pace, offering curriculum-based explanations in multiple languages including English, French, and Pidgin for accessibility in Cameroon.

## Features

### 🤖 AI-Powered Learning
- **Natural Language Processing**: Uses HuggingFace Transformers and OpenAI API for intelligent responses
- **Personalized Learning**: Adapts to individual learning styles (visual, auditory, kinesthetic)
- **Curriculum-Based**: Covers mathematics, physics, chemistry, biology, and more
- **Real-time Interaction**: WebSocket-based chat for smooth conversations

### 🌍 Multi-Language Support
- **English**: Primary language for educational content
- **French**: Full support for French-speaking students
- **Pidgin**: Cameroonian Pidgin support for local accessibility
- **Auto-Detection**: Automatic language detection and translation

### 🎙️ Voice Integration
- **Speech-to-Text**: Convert voice messages to text
- **Text-to-Speech**: Generate audio responses
- **Multi-Language Voice**: Support for different accents and languages

### 📊 Analytics & Progress Tracking
- **Learning Analytics**: Track student progress and performance
- **Teacher Dashboard**: Comprehensive insights for educators
- **Sentiment Analysis**: Monitor student emotions and engagement
- **Detailed Reports**: Generate progress reports and insights

### 🎮 Gamification
- **Points System**: Earn points for completing lessons and activities
- **Badges & Achievements**: Unlock badges for milestones
- **Leaderboards**: Compete with other students
- **Streaks**: Maintain learning streaks for bonus rewards

### 🔒 Privacy & Security
- **Data Privacy**: Ethical use of student data
- **Secure Authentication**: JWT-based authentication system
- **Role-Based Access**: Different permissions for students and teachers

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **AI/ML**: HuggingFace Transformers, OpenAI API
- **Authentication**: JWT tokens with password hashing
- **Real-time**: WebSockets for chat functionality
- **Task Queue**: Celery for background processing

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context + React Query
- **Routing**: React Router
- **Real-time**: Socket.io client
- **Charts**: Recharts for analytics visualization

### DevOps
- **Containerization**: Docker support
- **Deployment**: Ready for cloud deployment
- **Monitoring**: Logging and error tracking
- **Testing**: Unit and integration tests

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (for caching and task queue)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EduMind/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb edumind

   # Run migrations
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/edumind

# Security
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
HUGGINGFACE_API_KEY=your-huggingface-key
OPENAI_API_KEY=your-openai-key

# Speech Services
SPEECH_KEY=your-speech-service-key
SPEECH_REGION=eastus

# Redis
REDIS_URL=redis://localhost:6379
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Usage

### For Students

1. **Register/Login**: Create an account or log in
2. **Start Learning**: Begin a chat session with EduMind
3. **Ask Questions**: Type or speak your questions
4. **Get Help**: Receive personalized explanations and examples
5. **Track Progress**: View your learning analytics and achievements

### For Teachers

1. **Teacher Dashboard**: Access comprehensive student analytics
2. **Monitor Progress**: Track individual and class performance
3. **Create Assignments**: Design custom learning activities
4. **Generate Reports**: Get detailed insights and recommendations

## Project Structure

```
EduMind/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry point
│   ├── database/           # Database migrations
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── docs/                   # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Acknowledgments

- HuggingFace for transformer models
- Material-UI for the beautiful UI components
- FastAPI for the robust backend framework
- All contributors and supporters

---

**EduMind** - Empowering education through AI technology 🌟
