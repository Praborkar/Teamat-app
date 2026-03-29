import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketProvider';
import { LanguageProvider } from './context/LanguageContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);
