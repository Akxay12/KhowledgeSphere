import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/index';
import { OnboardingTransitionProvider } from './context/OnboardingTransitionContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('knowledgesphere_theme');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <OnboardingTransitionProvider>
          <AppRoutes />
        </OnboardingTransitionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}



