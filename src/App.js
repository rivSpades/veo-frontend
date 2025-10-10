import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { LanguageProvider } from './store/LanguageContext';
import { AuthProvider } from './store/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import router from './router';

/**
 * Main App Component
 * Wraps the application with necessary providers
 */
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
