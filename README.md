# 🛰️ Teamat

### **Elevated Real-Time Collaboration**
**Teamat** is a professional, minimalist, and high-performance real-time chat application designed for seamless team communication. Built with a "Plain UI" philosophy, it focuses on extreme clarity, speed, and premium user experience.

---

## ✨ Features

### 💎 Core Experience
- **Plain UI Design**: A stunning, full-bleed minimalist interface that eliminates distractions and maximizes focus.
- **Ultra-Fast Real-Time Messaging**: Powered by Socket.IO with optimistic UI updates for near-instant interaction.
- **Universal Search**: Quickly find channels and teammates with integrated search across the platform.
- **Presence 2.0**: Real-time online/offline status tracking with advanced presence indicators.
- **Multilingual Support**: Integrated language selector with real-time interface translation.

### 📁 Channel management
- **Dynamic Channels**: Create, rename, and manage channels with ease.
- **Danger Zone Actions**: Securely delete channels with portaled confirmation dialogs.
- **Member Control**: Add teammates by email and manage channel membership instantly.
- **Infinite History**: Fluid message history with optimized infinite scroll pagination.

### 👤 User Control
- **Functional Profiles**: Edit your name, email, and password directly within the app.
- **Secure Authentication**: Robust JWT-based auth flow with protected routing.
- **Responsive by Design**: A truly mobile-first architecture that scales perfectly from smartphones to ultrawide monitors.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Query, Socket.IO Client |
| **Backend** | Node.js, Express, Socket.IO, JWT, Mongoose |
| **Database** | MongoDB Atlas |
| **Real-time** | WebSockets (Socket.IO) |

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 2️⃣ Clone and Install
```sh
git clone https://github.com/your-repo/teamat.git
cd teamat
```

### 3️⃣ Backend Setup
```sh
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=4000
```
Start the backend server:
```sh
npm run dev
```

### 4️⃣ Frontend Setup
```sh
cd ../chat-frontend
npm install
```
Create a `.env` file in the `chat-frontend` directory:
```env
VITE_API_URL=http://localhost:4000
```
Start the development server:
```sh
npm run dev
```

---

## 🔌 API Reference

### **Authentication**
- `POST /auth/signup` — Register a new account.
- `POST /auth/login` — Sign in and receive a JWT.
- `PUT /auth/profile` — Update user profile details.

### **Channels**
- `GET /channels` — Retrieve all joined channels.
- `POST /channels` — Create a new channel.
- `PUT /channels/:id` — Rename an existing channel.
- `DELETE /channels/:id` — Permanently delete a channel.
- `POST /channels/:id/join` — Join a channel.

### **Messages**
- `GET /messages/:channelId?page=n` — Fetch paginated message history.

---

## 📡 Socket.IO Events

| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `joinChannel` | Join a specific channel room |
| Client → Server | `sendMessage` | Send a new real-time message |
| Server → Client | `newMessage` | Receive a new message (Optimistic) |
| Server → Client | `presence:update` | Real-time update of online users |
| Server → Client | `channel:updated` | Broadcast channel name changes |

---

## 📂 Project Structure

```text
Teamat/
├── chat-frontend/       # React + Vite Client
│   ├── src/
│   │   ├── components/  # Atomic UI Components
│   │   ├── context/     # Socket & Auth State
│   │   ├── hooks/       # Custom React Hooks
│   │   ├── pages/       # Layout Views
│   │   └── layout/      # Core App Shell
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── routes/      # REST Endpoints
│   │   ├── socket/      # WebSocket logic
│   │   ├── models/      # Mongoose Schemas
│   │   └── middleware/  # Auth & Logging
```

---

## 🚀 Deployment Guide

### 📂 Frontend (Vercel)
1. **Prepare**: Ensure `chat-frontend/vercel.json` exists (added by Antigravity).
2. **Deploy**: Push your code to GitHub and connect the `chat-frontend` folder to Vercel.
3. **Build Settings**: 
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**: Add `VITE_API_URL` pointing to your deployed Backend URL.

### 📂 Backend (Render / Railway)
1. **Deploy**: Connect the `backend` folder to your persistent host.
2. **Build Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `FRONTEND_URL`: Your final Vercel Production URL (e.g., `https://teamat.vercel.app`).

### 🔧 Important Configuration
The backend is now configured to dynamically allow CORS for the URL you provide in `FRONTEND_URL`. This ensures your real-time Socket.IO connections remain secure and stable.

---

## 🎨 UI Highlight: "The Plain Style"
Teamat follows the **Plain UI** design system—a philosophy that prioritizes content and communication over heavy gradients and shadows. The result is a high-contrast, lightning-fast interface that feels at home on any professional workstation.

---

## 🛡️ License
This project is licensed under the **MIT License**.

## 🙌 Author
Developed by **Prabor Kar**  
- [Portfolio](https://prabor.netlify.app)
- [GitHub](https://github.com/Praborkar)
- [LinkedIn](https://linkedin.com/in/prabor-kar/)
