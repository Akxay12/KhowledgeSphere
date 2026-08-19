import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../lib/toast';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (!isLoggedIn) {
      showToast("Login to access this feature");
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
}
