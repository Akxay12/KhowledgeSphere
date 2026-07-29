import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Explore from '../pages/Explore';
import Publish from '../pages/Publish';
import ResearchDetails from '../pages/ResearchDetails';
import Profile from '../pages/Profile';
import Bookmarks from '../pages/Bookmarks';
import Drafts from '../pages/Drafts';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Layout Dashboard */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/research/:id" element={<ResearchDetails />} />
          <Route path="/research-details" element={<ResearchDetails />} /> {/* Easy preview URL */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
