# ChatGPT Clone - MERN Stack

A full-stack AI-powered chatbot web application that replicates core features of ChatGPT using the MERN stack (MongoDB, Express.js, React.js, Node.js) with OpenAI API integration.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login
- **Real-time Chat**: Dynamic conversation interface with AI responses
- **Chat History**: Persistent storage and retrieval of conversations
- **Modern UI**: Responsive design with Tailwind CSS
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Markdown Support**: Rich text rendering for AI responses with syntax highlighting
- **Voice Input**: Speech-to-text functionality (Web Speech API)
- **Copy Responses**: One-click copy functionality for AI messages
- **Multiple Models**: Support for different OpenAI models (GPT-3.5, GPT-4)

## 📸 Screenshots

### Login Page
![Login Page](screenshots/Screenshot%202025-07-27%20152524.png)

### Registration Page
![Registration Page](screenshots/Screenshot%202025-07-27%20152641.png)

### Chat Interface
![Chat Interface](screenshots/Screenshot%202025-07-27%20152941.png)

### Chat with AI Response
![Chat with AI Response](screenshots/Screenshot%202025-07-27%20153146.png)

## 🛠️ Tech Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- React Markdown
- Heroicons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API Integration
- Security middleware (Helmet, CORS, Rate Limiting)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API Key

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chatgpt-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

**Backend (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ChatGPT Clone
VITE_APP_VERSION=1.0.0
```

### 5. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your backend `.env` file

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
chatgpt-clone/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── chat/
│   │   │       ├── ChatLayout.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Message.jsx
│   │   │       └── ChatInput.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/preferences` - Update user preferences

### Chat
- `GET /api/chat` - Get all user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id` - Get specific chat
- `POST /api/chat/:id/messages` - Send message
- `PATCH /api/chat/:id` - Update chat title
- `DELETE /api/chat/:id` - Delete chat

## 🎨 Features in Detail

### Authentication System
- Secure password hashing with bcrypt
- JWT token-based authentication
- Protected routes and middleware
- User session management

### Chat Interface
- Real-time messaging with AI
- Message history persistence
- Typing indicators
- Responsive design for mobile and desktop

### AI Integration
- OpenAI GPT models integration
- Configurable model selection
- Token usage tracking
- Error handling for API failures

### Advanced Features
- Dark/Light theme toggle
- Voice input with speech recognition
- Markdown rendering with syntax highlighting
- Copy-to-clipboard functionality
- Chat management (rename, delete, archive)

## 🚨 Important Notes

1. **OpenAI API Key**: Required for AI functionality
2. **MongoDB**: Ensure MongoDB is running locally or use MongoDB Atlas
3. **Environment Variables**: Update all `.env` files with your actual values
4. **CORS**: Frontend and backend URLs are configured for development
5. **Security**: Change JWT secret and other sensitive data in production

## 🐛 Troubleshooting

### Common Issues:
1. **MongoDB Connection**: Ensure MongoDB is running
2. **OpenAI API**: Check API key validity and billing
3. **CORS Errors**: Verify frontend/backend URL configuration
4. **Port Conflicts**: Change ports if 5000 or 5173 are in use

## 📝 License

This project is for educational purposes. Please respect OpenAI's usage policies.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---
## 🙋‍♂️ Author

- Gunalan A [@Gunalan183](https://github.com/Gunalan183)

**Happy Coding! 🚀**
