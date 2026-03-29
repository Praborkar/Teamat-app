import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AppLayout from './layout/AppLayout'
import SplashScreen from './components/SplashScreen'
import { useAuth } from './hooks/useAuth'
import { Toaster } from "react-hot-toast"

export default function App() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  if (loading || showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="font-space">

      {/* ⭐ GLOBAL DARK THEMED TOASTER */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,

          // Default Toast Style
          style: {
            background: "#2b2d31",
            color: "#f2f3f5",
            border: "1px solid #3c3f41",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "14px",
          },

          // Success Toast
          success: {
            iconTheme: {
              primary: "#3ba55d",
              secondary: "#f2f3f5",
            },
            style: {
              background: "#1f2a21",
              border: "1px solid #3f6140",
              color: "#d4ffd9",
            },
          },

          // Error Toast
          error: {
            iconTheme: {
              primary: "#ed4245",
              secondary: "#f2f3f5",
            },
            style: {
              background: "#2f1d1d",
              border: "1px solid #5c2b2b",
              color: "#ffd6d6",
            },
          },
        }}
      />

      {/* ROUTES */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/app/*"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/"
          element={<Navigate to={user ? "/app" : "/login"} replace />}
        />

        <Route path="*" element={<div className="p-4">404 Not Found</div>} />
      </Routes>
    </div>
  )
}
